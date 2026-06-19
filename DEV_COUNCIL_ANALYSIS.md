# ☩ SÃO JORGE V2 — Dev Council Analysis

**Date:** 2026-06-19
**Project:** São Jorge V2 — Eastern Orthodox Parish Webapp
**Stack:** Cloudflare Workers + D1 + KV + R2 + AI + Cron (API), Next.js 15 (Web), Monorepo
**Council Seat Count:** 7

---

## SHARP TECHNICAL QUESTION

> **Given the current architecture — a single 505-line Cloudflare Worker handling all HTTP routes, cron-triggered scraping with AI translation, a static-export Next.js 15 frontend, and a D1 database with 8 tables — what are the highest-impact architectural risks and improvements needed to ensure reliability, maintainability, security, and performance as the parish's digital presence grows?**

Specific sub-questions framed for the council:
1. Can the single-file Worker architecture scale to handle more routes, middleware, and business logic without hitting CPU time limits?
2. Is the scraper resilient enough for production (orthocal.info downtime, AI translation failures, partial data)?
3. Is the KV cache invalidation strategy correct for stale data prevention?
4. Is Bearer token auth sufficient for admin routes exposed on a public API?
5. Are the D1 query patterns optimal (N+1 queries, missing indexes, batch operations)?
6. Is the static-export Next.js frontend the right choice for a bilingual content-heavy site with admin panels?
7. Is the shared type system correctly aligned between API and Web packages?

---

## COUNCIL TRANSCRIPT

---

### SEAT 1: THE ARCHITECT
**Focus:** System design, scalability, structural integrity

**Analysis:**

The monorepo structure with `packages/api`, `packages/web`, `packages/shared` is sound. The shared types package (`@sao-jorge/shared`) is the right approach for a TypeScript monorepo. However, the API layer has a critical structural problem: **all 505 lines live in a single file** (`packages/api/src/index.ts`). This file contains type definitions, CORS helpers, auth logic, the orthocal scraper, AI translation, 12+ HTTP route handlers, and the cron trigger — all in one module.

**Structural Issues:**

1. **Single-file Worker (CRITICAL):** The file `packages/api/src/index.ts` is a 20KB monolith. Every route handler, the scraper, translation logic, and cron are bundled together. This violates separation of concerns and makes testing impossible. Cloudflare Workers have a 1MB compressed limit for the script — we're fine on size, but the cognitive load is unmanageable.

2. **No middleware layer:** Auth checks are inlined at line 391-395 with `checkAdminAuth()`. CORS headers are manually added to every response via `corsHeaders()`. There's no middleware pipeline — if we need rate limiting, logging, or request validation, it must be added to every handler.

3. **No route router:** Routes are matched with `if/else` chains and `path.startsWith()`. This is fragile — `/api/day/` matching will also match `/api/day/foo-bar` where `foo-bar` isn't a valid date. The date handler at line 316-319 extracts the date with `path.split('/api/day/')[1]` which could include query strings or trailing slashes.

4. **Static export limitation:** The Next.js app uses `output: 'export'` in `next.config.ts`. This means no server-side rendering, no API routes, no middleware. The admin panel at `/admin/*` is entirely client-side with `localStorage.getItem("adminToken")` — this is a static site making authenticated API calls. It works, but it means the admin token is exposed in browser JS and there's no server-side session management.

5. **No environment validation:** The `Env` interface declares `ADMIN_TOKEN` as `string` but there's no runtime validation that secrets are set. If `ADMIN_TOKEN` is undefined, `checkAdminAuth` will compare against `undefined`, which could accidentally allow access if the client sends `Bearer undefined`.

**Recommendations:**
- Split `index.ts` into modular files: `routes/public.ts`, `routes/admin.ts`, `handlers/scraper.ts`, `handlers/translator.ts`, `middleware/auth.ts`, `middleware/cors.ts`
- Introduce a lightweight router (e.g., `itty-router` or a simple trie-based matcher)
- Add runtime env validation at Worker startup
- Consider Next.js API routes or Cloudflare Pages Functions for the admin layer

---

### SEAT 2: THE SKEPTIC
**Focus:** What can go wrong, failure modes, edge cases

**Analysis:**

I'm going to stress-test every assumption in this codebase.

**Scraper Failure Modes:**

1. **orthocal.info goes down:** The scraper uses `Promise.allSettled()` (line 192-194) which is good — it won't crash on a single failure. BUT: if orthocal.info returns a non-OK status, `fetchOrthocal` throws at line 152. The error is caught by `allSettled`, logged, and the date is skipped. **However**, the remaining successful dates still get written to D1. This means after a partial scrape, some dates have fresh data and others have stale data from the previous run. There's no transaction wrapping the 8 inserts (lines 238-248), so a mid-scrape failure leaves the database in an inconsistent state.

2. **AI translation returns garbage:** The `translateToPtBr` function (line 91-134) sends all feast names and saints in a single prompt. If the LLM returns fewer lines than inputs (line 124-126), the fallback is the original English text. This means **feast names could appear in English on the Portuguese site**. Worse, if the LLM returns *more* lines than expected (e.g., adds explanations), the extra lines are silently ignored but the mapping could be offset, causing **saints' names to appear as feast names**.

3. **Date parsing bug:** `todayBrasilia()` at line 56-58 uses `toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })`. This is correct for the date string. BUT the scraper's date generation at line 186-188 creates a `new Date(today)` where `today` is a string like `"2026-06-19"`. In JavaScript, `new Date("2026-06-19")` parses as UTC midnight, which in São Paulo time (UTC-3) is **June 18 at 9 PM**. Then `d.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })` could return the wrong date near midnight. This is a subtle timezone bug that will cause the scraper to fetch the wrong day's data if the cron runs near midnight UTC.

4. **KV cache poisoning:** At line 272, cached data is stored with `expirationTtl: 86400` (24 hours). But the cron only invalidates today's cache (line 500: `env.DAY_CACHE.delete('day:' + todayBrasilia())`). If the scraper updates dates 2-8, their KV caches are NOT invalidated. So if date `2026-06-20` was cached yesterday with null data (before the scraper ran), it will serve null data for up to 24 hours even after the scraper has written the correct data.

5. **Admin auth bypass:** The `checkAdminAuth` function at line 60-65 uses a simple string comparison: `token === env.ADMIN_TOKEN`. This is vulnerable to **timing attacks** — an attacker can determine the token character-by-character by measuring response times. For a parish website this is low-risk, but it's still a flaw. More critically, there's no token rotation, no expiration, and no brute-force protection.

6. **JSON.parse without try-catch in handleDayByDate:** At line 289, `JSON.parse(row.enrichment)` is called without a try-catch. If the enrichment field contains invalid JSON, this will throw a 500 error. The `handleDayToday` function has a try-catch (line 268-269), but `handleDayByDate` does not. **Inconsistent error handling.**

7. **Slug injection in service routes:** At line 329, the slug is extracted with `path.split('/api/services/')[1]?.replace('/', '')`. The `.replace('/', '')` only removes the FIRST slash (JavaScript `String.replace` with a string argument only replaces the first match). If someone sends `/api/services/foo/bar/baz`, the slug becomes `bar/baz`, which is then used in a D1 query. This won't cause SQL injection (D1 uses parameterized queries), but it will return unexpected results.

**Recommendations:**
- Wrap scraper D1 writes in a transaction
- Add response validation for AI translation output
- Fix the timezone bug in scraper date generation
- Invalidate ALL date caches in the KV after scraping, not just today
- Use `crypto.timingSafeEqual` for token comparison
- Add try-catch to `handleDayByDate` enrichment parsing
- Use `replaceAll` or a regex for slug extraction

---

### SEAT 3: THE PRAGMATIST
**Focus:** What matters most, effort vs. impact, shipping

**Analysis:**

This is a parish website. The congregation needs it to work. The admin (probably one person) needs to manage content. Let's prioritize ruthlessly.

**What's actually working well:**
- The monorepo setup is clean and standard
- The shared types package prevents type drift
- `Promise.allSettled` in the scraper is the right call
- The static export + client-side admin pattern is pragmatic for a small team
- The service text versioning system is well-designed
- The celebration mode toggle is a genuinely nice UX touch

**What needs to be fixed NOW (before launch):**

1. **The timezone bug in the scraper** (Seat 2's finding #3) — this will cause wrong liturgical data to display. One-line fix, high impact.

2. **The missing try-catch in `handleDayByDate`** (Seat 2's finding #6) — this will cause 500 errors for users. One-line fix, high impact.

3. **KV cache invalidation** (Seat 2's finding #4) — users will see stale/missing data. Need to invalidate all 8 date keys after scraping.

4. **The `ADMIN_TOKEN` could be undefined** (Seat 1's finding #5) — if the secret isn't set, auth is broken. Add a startup check.

**What can wait (post-launch):**

5. Splitting the Worker into modules — it's 505 lines, not 5000. It's manageable for now. Refactor when it hits 1000+ lines or when you need to add a second Worker.

6. The middleware abstraction — the inline CORS and auth checks are verbose but clear. Refactor when you need to add a third cross-cutting concern.

7. The `itty-router` migration — the if/else chain works. It's not elegant, but it's debuggable.

**What I'd actually do this week:**
1. Fix the timezone bug
2. Add the try-catch
3. Fix KV invalidation
4. Add env validation
5. Deploy and monitor

**What I'd do next month:**
1. Split the Worker into 4-5 files
2. Add proper error responses (not just `alert()` in admin)
3. Add a health check that verifies D1 connectivity
4. Add a "last scraped" timestamp to the health endpoint

---

### SEAT 4: THE PURIST
**Focus:** Code quality, type safety, correctness, best practices

**Analysis:**

I have opinions. Many of them.

**Type Safety Issues:**

1. **`any` everywhere:** The codebase uses `any` liberally — `data: unknown` in `jsonResponse` is fine, but `const aiResult: any` (line 110), `const body = await request.json() as any` (lines 398, 412, 425, 450), and `catch (e: any)` (line 127) all abandon type safety. The `as any` casts on request bodies mean we get zero validation on admin inputs. A malformed blog post submission will silently insert bad data into D1.

2. **Shared types mismatch:** The `LiturgicalDay` interface in `packages/shared/src/index.ts` uses camelCase (`toneOfWeek`, `fastType`, `feastNamePt`), but the D1 rows use snake_case (`tone_of_week`, `fast_type`, `feast_name_pt`). The API handler spreads the D1 row directly into the response (`{ ...row, enrichment: enrichmentData }` at line 271), which means the frontend receives **snake_case fields** but the shared type defines **camelCase fields**. The `fetchDay` function in `packages/web/lib/api.ts` types the response as `LiturgicalDay` but the actual data has different field names. **This is a silent type lie.**

3. **Inconsistent enrichment parsing:** `handleDayToday` wraps `JSON.parse` in try-catch (line 268-269). `handleDayByDate` does not (line 289). The enrichment field is defined as "JSON" in the schema comment but stored as a plain string. There's no consistent serialization/deserialization strategy.

4. **Missing input validation:** The admin routes accept `request.json() as any` and directly bind values to SQL queries. There's no validation library (Zod, Valibot, etc.) and no sanitization. The `slug` field in blog posts (line 417) could contain special characters that break URL routing on the frontend.

5. **The `fastTypeMap` is incomplete:** At line 155-158, the fast type map only covers fast_exception values 0, 1, 2, 3, 4, 7, 11, 49. The orthocal API could return other values. The fallback `'none'` at line 178 masks data errors.

**Code Quality Issues:**

6. **Inconsistent formatting:** Lines 435-447 (service-texts GET) and 449-466 (service-texts POST) and 468-482 (service-texts PUT) have different indentation than the rest of the file — they use extra leading spaces. This suggests copy-paste from different editors.

7. **Dead code:** The `FormState` interface in `packages/web/app/admin/layout.tsx` (line 5-8) is defined but never used. The `useRouter` import in `packages/web/app/admin/blog/page.tsx` (line 4) is unused.

8. **The `fetchCatechesisLessonsByUnitSlug` function** in `packages/web/lib/api.ts` (line 77-81) calls `/api/catechesis/${unitSlug}/lessons` but there's no corresponding route in the Worker. This will always return 404.

9. **R2 bucket is bound but never used:** The `MEDIA` R2 bucket is declared in `wrangler.toml` and in the `Env` interface, but no route uses it. Dead configuration.

10. **No database connection pooling awareness:** D1 handles connections automatically, but the scraper runs 8 sequential `.run()` calls (line 247) in a loop. These should be batched with `DB.batch()` for atomicity and performance.

**Recommendations:**
- Add Zod schemas for all admin input validation
- Create a mapping layer between D1 snake_case rows and shared camelCase types
- Use `DB.batch()` for scraper writes
- Remove dead code and unused imports
- Standardize formatting with a shared ESLint/Prettier config
- Add the missing `/api/catechesis/:slug/lessons` route or remove the dead frontend function
- Remove the R2 binding or implement media upload

---

### SEAT 5: THE OPERATOR
**Focus:** Deployment, monitoring, observability, incident response

**Analysis:**

I'm thinking about what happens at 3 AM when something breaks.

**Observability Gaps:**

1. **No structured logging:** The codebase uses `console.log` and `console.error` with string prefixes like `[scraper]`, `[cron]`, `[translate]`. Cloudflare Workers captures these, but they're not structured. There's no correlation ID, no request ID, no way to trace a single request through the system. When the cron fails, you'll see `Scraper error: orthocal 2026-06-20: 503` but you won't know which invocation, what the full context was, or which dates succeeded.

2. **No alerting:** The cron runs at 3 AM São Paulo time (line 29 of wrangler.toml: `0 3 * * *`). If it fails, nobody knows until someone checks the site and sees yesterday's data. There's no integration with Cloudflare's notification system, no webhook to a messaging platform, no email alert.

3. **No health check depth:** The `/api/health` endpoint (line 308-310) returns `{ ok: true, env, date }`. It doesn't check D1 connectivity, KV availability, or whether the scraper ran successfully today. A health check that always returns 200 is not a health check — it's a ping.

4. **No deployment strategy:** The wrangler.toml has no staging environment configured (the dev environment at line 41-45 has a TODO for the D1 database ID). There's no CI/CD pipeline defined. Deployments are manual (`wrangler deploy`). A bad deploy takes down the entire API with no rollback mechanism.

5. **No rate limiting:** The public API has no rate limiting. The admin endpoints especially — `/api/admin/scrape-now` triggers the full scraper with AI translation. If someone discovers the admin token, they could burn through AI quota by hitting this endpoint repeatedly.

6. **No CORS restriction:** The `corsHeaders()` function returns `Access-Control-Allow-Origin: '*'` (line 42). This means any website can make requests to the API. For public read-only endpoints this is fine, but it also applies to admin endpoints. A malicious site could attempt admin operations if the token is somehow leaked.

7. **Secrets management:** The `ADMIN_TOKEN` is set via `wrangler secret put` which is correct. But there's no documentation of what the token format should be, no rotation policy, and the token is stored in `localStorage` on the admin frontend (line 38 of admin/liturgical/page.tsx), which is vulnerable to XSS.

**Recommendations:**
- Add structured logging with request IDs and correlation
- Add a webhook notification for cron failures (Cloudflare Notifications or a simple fetch to a messaging endpoint)
- Deepen the health check to verify D1, KV, and last scrape time
- Configure the staging environment with a real D1 database ID
- Add rate limiting to admin endpoints (Cloudflare Rate Limiting or a KV-based counter)
- Restrict CORS on admin routes to the admin frontend origin
- Move admin token from localStorage to httpOnly cookie (requires server-side component)
- Add a deployment checklist / CI pipeline

---

### SEAT 6: THE SYNTHESIZER
**Focus:** Bringing it all together, finding consensus, resolving conflicts

**Analysis:**

Let me map the concerns from all seats and find the signal in the noise.

**Consensus Issues (all seats agree):**

| Issue | Architect | Skeptic | Pragmatist | Purist | Operator |
|-------|-----------|---------|------------|--------|----------|
| Single-file Worker needs splitting | ✅ | | ⏳ (later) | ✅ | |
| Scraper timezone bug | | ✅ | ✅ (now) | | |
| KV cache incomplete invalidation | | ✅ | ✅ (now) | | |
| Missing try-catch in handleDayByDate | | ✅ | ✅ (now) | ✅ | |
| No input validation on admin routes | | | | ✅ | ✅ |
| Admin token in localStorage | | | | | ✅ |
| Type mismatch snake_case vs camelCase | | | | ✅ | |
| No structured logging/alerting | | | | | ✅ |
| D1 writes not batched | | | | ✅ | |
| Dead code (R2, unused functions) | | | | ✅ | |

**Resolving Conflicts:**

The Architect wants to split the Worker NOW. The Pragmatist says it can wait. **Synthesis:** Split it, but do it as a pure refactor — no behavior changes. It's 505 lines; a mechanical split into 5 files takes 2 hours and reduces risk for every future change.

The Purist wants Zod validation on all inputs. The Pragmatist says ship first. **Synthesis:** Add lightweight validation for the most critical path (scraper output and admin liturgical edits) now. Add comprehensive validation post-launch.

The Operator wants httpOnly cookies for the admin token. This requires a server-side component that doesn't exist in the static export architecture. **Synthesis:** For now, add a Content Security Policy header to mitigate XSS risk, and document the localStorage limitation. Plan for a server-side auth layer (Cloudflare Pages Functions or a separate auth service) as a medium-term improvement.

**The Big Picture:**

This is a well-architected project for its scale. The data model is thoughtful (service versioning, conflict log, enrichment JSON). The frontend is clean. The AI translation approach is creative. The issues are mostly at the seams — between the API and the database (type mismatches), between the scraper and the cache (invalidation gaps), and between the admin UI and the API (auth and validation).

The highest-leverage improvements are:
1. **Fix the data pipeline** (timezone bug, cache invalidation, error handling) — this affects every user every day
2. **Secure the admin surface** (token handling, input validation, CORS) — this affects the one admin but could affect all users if compromised
3. **Improve observability** (structured logging, health checks, alerting) — this affects the ability to detect and fix issues

---

### SEAT 7: THE MORTICIAN
**Focus:** What should be killed, deprecated, or removed

**Analysis:**

I'm here to tell you what to stop doing.

**Kill Immediately:**

1. **The `fetchCatechesisLessonsBySlug` function** (`packages/web/lib/api.ts`, line 77-81): It calls a non-existent API route. It will never work. It's dead code that misleads developers. Delete it.

2. **The unused `FormState` interface** (`packages/web/app/admin/layout.tsx`, line 5-8): Dead interface. Delete it.

3. **The unused `useRouter` import** (`packages/web/app/admin/blog/page.tsx`, line 4): Unused import. Delete it.

4. **The `MEDIA` R2 bucket binding** (`wrangler.toml`, line 23-26): Bound but never used. Remove the binding from wrangler.toml and the `MEDIA` field from the `Env` interface. If you need media storage later, add it back with a proper upload flow.

5. **The `conflict_log` table** (`packages/api/migrations/001_schema.sql`, line 139-150): Created but never written to or read from. The conflict resolution system it was designed for doesn't exist yet. Remove it to reduce schema confusion. It can be re-added when the conflict resolution feature is built.

6. **The `chants` table** (`packages/api/migrations/001_schema.sql`, line 126-136): Created but never used. No API routes read or write to it. Remove it.

**Deprecate / Reconsider:**

7. **The `enrichment` field as a JSON string in `liturgical_days`:** This is a polymorphic field that could be a saints list (plain string) or structured data (JSON). The code at lines 267-270 tries JSON.parse and falls back to the raw string. This is a schema smell. Either make it always JSON (with a `null` default) or split it into dedicated columns. The current approach means the frontend can't reliably consume it.

8. **The `titleEn` field mapping:** At line 245, the scraper stores `day.titleEn` (which is `data.titles?.[0]`) as `feast_name_en`. But `feast_name_en` is actually `data.feasts?.[0] ?? data.summary_title ?? data.titles?.[0]` (line 161). So `titleEn` and `feast_name_en` are different fields that may or may not be the same depending on the data. This is confusing. Rename `titleEn` to something clearer or merge the logic.

9. **The static export + client-side admin pattern:** I'm not killing this — it's pragmatic for a small team. But I'm flagging it as technical debt. When the admin panel grows beyond simple CRUD, you'll need server-side rendering or API routes. Plan for this migration.

10. **The `inlineMarkdown` function in ServiceView.tsx** (line 25-34): This is a hand-rolled markdown parser that only handles bold and italic. It uses `dangerouslySetInnerHTML` which is a XSS vector if any section text contains HTML. Either use a proper markdown library (like `marked` or `react-markdown`) or at minimum add HTML entity escaping for `<` and `>` in the markdown function. Actually, it DOES escape `&`, `<`, `>` at lines 27-29, so XSS is mitigated. But a proper library would be more maintainable.

---

## PRIORITIZED ACTIONABLE RECOMMENDATIONS

### P0 — CRITICAL (Fix Before Launch)

| # | Recommendation | File(s) | Change |
|---|---------------|---------|--------|
| 1 | **Fix timezone bug in scraper date generation** | `packages/api/src/index.ts` lines 183-189 | Replace `new Date(today)` with `new Date()` and use the same `toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })` for all date generation. The current code parses a date string as UTC, which shifts the date near midnight. |
| 2 | **Add try-catch to enrichment parsing in handleDayByDate** | `packages/api/src/index.ts` line 289 | Wrap `JSON.parse(row.enrichment)` in a try-catch, matching the pattern in `handleDayToday` (lines 267-270). Without this, invalid JSON in the enrichment field causes a 500 error. |
| 3 | **Fix KV cache invalidation to cover all 8 dates** | `packages/api/src/index.ts` lines 496-504 (scheduled function) | After `runScraper(env)`, loop through all 8 dates and delete their KV keys, not just today's. Currently only `day:today` is invalidated. |
| 4 | **Add runtime env validation** | `packages/api/src/index.ts` lines 296-300 | At the start of the `fetch` handler, check that `env.ADMIN_TOKEN` is defined and non-empty. Return a 500 with a clear error if not. This prevents accidental auth bypass when the secret is misconfigured. |

### P1 — HIGH (Fix Within First Month)

| # | Recommendation | File(s) | Change |
|---|---------------|---------|--------|
| 5 | **Batch D1 writes in scraper** | `packages/api/src/index.ts` lines 226-249 | Replace the loop of 8 individual `.run()` calls with `env.DB.batch(statements)`. Create an array of prepared statements and execute them atomically. This ensures all-or-nothing writes and is faster. |
| 6 | **Use timing-safe token comparison** | `packages/api/src/index.ts` lines 60-65 | Replace `token === env.ADMIN_TOKEN` with `crypto.timingSafeEqual(Buffer.from(token), Buffer.from(env.ADMIN_TOKEN))`. Prevents timing attacks on the admin auth. |
| 7 | **Fix slug extraction in service routes** | `packages/api/src/index.ts` lines 329, 347, 372 | Replace `.replace('/', '')` with `.replace(/\/.*/, '')` or `.split('/')[0]` to extract only the slug and ignore trailing path segments. |
| 8 | **Fix snake_case/camelCase type mismatch** | `packages/api/src/index.ts` lines 271, 289; `packages/shared/src/index.ts` lines 3-24 | Create a mapping function that converts D1 row field names (snake_case) to the shared type field names (camelCase). Apply it in all handlers that return D1 rows. Alternatively, alias the D1 columns in SQL queries. |
| 9 | **Add structured logging with request IDs** | `packages/api/src/index.ts` (all handlers) | Generate a UUID at the start of each request and include it in all log messages. Replace `console.log('[scraper]...')` with `console.log(JSON.stringify({ level: 'info', component: 'scraper', requestId, message: '...' }))`. |
| 10 | **Deepen health check endpoint** | `packages/api/src/index.ts` lines 308-310 | Add D1 connectivity check (`SELECT 1`), KV check, and last scrape timestamp. Return structured health status: `{ ok: true, checks: { d1: true, kv: true, lastScrape: '2026-06-19T03:00:00Z' } }`. |
| 11 | **Add cron failure alerting** | `packages/api/src/index.ts` lines 496-504; new file `packages/api/src/webhooks.ts` | After the catch block in the `scheduled` handler, send a webhook notification (e.g., to a Discord/Slack webhook URL stored as a secret) with the error details. |
| 12 | **Restrict CORS on admin routes** | `packages/api/src/index.ts` lines 40-47, 391-395 | Return different CORS headers for admin vs public routes. For admin routes, set `Access-Control-Allow-Origin` to the specific admin frontend origin instead of `*`. |

### P2 — MEDIUM (Fix Within First Quarter)

| # | Recommendation | File(s) | Change |
|---|---------------|---------|--------|
| 13 | **Split Worker into modular files** | `packages/api/src/index.ts` → split into: `packages/api/src/index.ts` (entry), `packages/api/src/routes/public.ts`, `packages/api/src/routes/admin.ts`, `packages/api/src/handlers/scraper.ts`, `packages/api/src/handlers/translator.ts`, `packages/api/src/middleware/auth.ts`, `packages/api/src/middleware/cors.ts`, `packages/api/src/types.ts` | Pure refactor — no behavior changes. Each file gets a single responsibility. The entry point imports and wires everything together. |
| 14 | **Add input validation with Zod** | New file `packages/api/src/schemas.ts`; modify all admin route handlers | Define Zod schemas for liturgical day input, blog post input, bulletin input, and service text input. Validate `request.json()` against the schema before processing. Return 400 with validation errors on mismatch. |
| 15 | **Remove dead code** | `packages/web/lib/api.ts` line 77-81 (delete `fetchCatechesisLessonsByUnitSlug`), `packages/web/app/admin/layout.tsx` line 5-8 (delete `FormState`), `packages/web/app/admin/blog/page.tsx` line 4 (delete `useRouter` import), `packages/api/wrangler.toml` lines 23-26 (remove R2 binding), `packages/api/src/index.ts` line 9 (remove `MEDIA` from Env) | Clean up unused code to reduce confusion. |
| 16 | **Remove unused database tables** | New migration `packages/api/migrations/004_cleanup.sql` | `DROP TABLE IF EXISTS conflict_log; DROP TABLE IF EXISTS chants;` — these tables are created but never used. |
| 17 | **Fix enrichment field schema** | `packages/api/migrations/005_enrichment_json.sql`, `packages/api/src/index.ts` lines 266-270, 289 | Make the enrichment field always valid JSON (default `'null'`). Add a CHECK constraint: `CHECK (enrichment IS NULL OR json_valid(enrichment))`. Update all handlers to assume JSON. |
| 18 | **Add rate limiting to admin endpoints** | New file `packages/api/src/middleware/rate-limit.ts`; `packages/api/src/routes/admin.ts` | Use KV to track request counts per IP/token. Return 429 when limits are exceeded. Especially important for `/api/admin/scrape-now` which triggers AI calls. |
| 19 | **Configure staging environment** | `packages/api/wrangler.toml` lines 41-50 | Uncomment and fill in the dev D1 database ID. Add a separate KV namespace for dev. Use `wrangler deploy --env dev` for staging deployments. |
| 20 | **Add Content Security Policy headers** | `packages/api/src/middleware/cors.ts` (new) | Add a `Content-Security-Policy` header to all responses. For the admin pages, restrict `script-src` to mitigate XSS risk from the localStorage token pattern. |

### P3 — LOW (Nice to Have / Future)

| # | Recommendation | File(s) | Change |
|---|---------------|---------|--------|
| 21 | **Replace hand-rolled markdown with a library** | `packages/web/app/servicos/[slug]/ServiceView.tsx` lines 25-34 | Replace `inlineMarkdown()` with `react-markdown` or `marked` for proper markdown rendering. |
| 22 | **Add proper admin auth with sessions** | New: Cloudflare Pages Functions or separate auth service | Move from localStorage Bearer token to httpOnly cookie sessions. Requires a server-side component. |
| 23 | **Add API versioning** | `packages/api/src/routes/public.ts` | Prefix routes with `/api/v1/` to allow future breaking changes. |
| 24 | **Add database indexes for common queries** | New migration `packages/api/migrations/006_indexes.sql` | Add indexes: `liturgical_days(scraped_at)`, `service_texts(slug, status, version)`, `blog_posts(status, published_at)`, `catechesis_lessons(unit_slug, status)`. |
| 25 | **Add E2E tests** | New: `packages/api/tests/`, `packages/web/e2e/` | Test the critical path: cron runs → data in D1 → KV cached → API returns correct data → frontend renders. Use Miniflare for Worker testing. |

---

## SUMMARY

The São Jorge V2 project is a well-conceived monorepo with a thoughtful data model and clean frontend. The critical issues are in the API layer: a timezone bug in the scraper, incomplete KV cache invalidation, missing error handling, and a type mismatch between the database layer and the shared types. The single-file Worker architecture is manageable at 505 lines but should be split before it grows further. The admin auth pattern (localStorage + Bearer token) is functional but should be hardened with CSP headers and eventually replaced with server-side sessions.

**Total recommendations:** 25
**P0 (Critical):** 4
**P1 (High):** 8
**P2 (Medium):** 8
**P3 (Low):** 5

---

*☩ Dev Council Analysis — São Jorge V2 — 2026-06-19*
