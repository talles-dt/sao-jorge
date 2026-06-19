# Dev Council Analysis — Executive Summary

## What Was Done
Ran a complete 7-seat Dev Council analysis of the São Jorge V2 project by reading all key source files:
- `packages/api/src/index.ts` (505-line Cloudflare Worker — the entire API)
- `packages/web/app/layout.tsx` (Next.js root layout)
- `packages/web/app/page.tsx` (homepage)
- `packages/web/app/globals.css` (Tailwind + custom CSS variables)
- `packages/api/wrangler.toml` (Cloudflare config)
- `packages/web/lib/api.ts` (frontend API client)
- `packages/shared/src/index.ts` (shared TypeScript types)
- `packages/api/migrations/001_schema.sql` (D1 schema)
- All admin pages, service views, and supporting files

## Key Findings

### Critical Bugs (P0 — must fix before launch)
1. **Timezone bug in scraper**: `new Date("2026-06-19")` parses as UTC, causing wrong date near midnight in São Paulo timezone
2. **Missing try-catch**: `handleDayByDate` calls `JSON.parse` without error handling (500 error risk)
3. **Incomplete KV cache invalidation**: Only today's cache is cleared after scraping; dates 2-8 retain stale data
4. **Undefined ADMIN_TOKEN**: No runtime check; if secret is misconfigured, auth comparison against `undefined` could bypass

### High-Impact Architectural Issues (P1)
5. **D1 writes not batched**: 8 individual `.run()` calls instead of `DB.batch()` — no atomicity
6. **Timing-unsafe token comparison**: `token === env.ADMIN_TOKEN` vulnerable to timing attacks
7. **Slug extraction bug**: `.replace('/', '')` only removes first slash
8. **snake_case/camelCase type mismatch**: D1 rows use snake_case, shared types use camelCase — silent type lie
9. **No structured logging or alerting**: Cron failures at 3 AM go unnoticed
10. **Shallow health check**: Doesn't verify D1, KV, or last scrape time
11. **CORS too permissive**: Admin routes allow `*` origin
12. **No rate limiting**: `/api/admin/scrape-now` can burn AI quota

### Structural Concerns (P2)
13. **Single-file Worker**: 505 lines, all routes + scraper + translator + cron in one file
14. **No input validation**: All admin routes use `as any` — no Zod/Valibot schemas
15. **Dead code**: Unused R2 binding, unused `conflict_log` and `chants` tables, non-existent `/api/catechesis/:slug/lessons` route called from frontend
16. **Enrichment field schema smell**: Polymorphic field (plain string or JSON) with inconsistent parsing
17. **No staging environment**: Dev D1 database ID is TODO
18. **Admin token in localStorage**: XSS-vulnerable without CSP

### What to Kill (Mortician)
- `fetchCatechesisLessonsByUnitSlug` function (calls non-existent route)
- `FormState` interface (unused)
- `useRouter` import in admin/blog (unused)
- `MEDIA` R2 binding (never used)
- `conflict_log` and `chants` tables (never used)

## Files Created
- `/home/timon/Documents/sao-jorge/sao-jorge-v2/DEV_COUNCIL_ANALYSIS.md` — Full council transcript (all 7 seats) + 25 prioritized recommendations with specific file paths and changes

## Recommendation Count
- P0 (Critical): 4
- P1 (High): 8
- P2 (Medium): 8
- P3 (Low): 5
- **Total: 25 actionable recommendations**

## Top 3 Things to Do This Week
1. Fix the timezone bug in the scraper (1 line)
2. Add try-catch to `handleDayByDate` enrichment parsing (3 lines)
3. Fix KV cache invalidation to clear all 8 dates (5 lines)
