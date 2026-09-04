# ☩ São Jorge Parish Webapp — Deploy Guide
## Igreja Ortodoxa Antioquena de Curitiba

Everything you need to go from zero to live. Follow in order.

---

## Project Structure

```
sao-jorge-deploy/
├── deploy.sh          ← Master deploy script (runs everything)
├── agents/            ← Agent .md prompts (uploaded to R2, used as LLM system prompts)
├── migrations/        ← D1 SQL (schema + seed data)
├── workers/           ← Cloudflare Workers backend (TypeScript)
└── nextjs/            ← Next.js 15 frontend (Cloudflare Pages)
```

---

## Prerequisites

### 1. Install tools

```bash
# Node.js 20+ required
node --version   # must be >= 20

# Install Wrangler globally
npm install -g wrangler

# Verify
wrangler --version
```

### 2. Cloudflare account

You need a free Cloudflare account. Log in:

```bash
wrangler login
# Opens browser — authorize in dashboard
wrangler whoami   # verify: should show your email
```

### 3. API keys you need before starting

| Key | Where to get it |
|---|---|
| `ANTHROPIC_KEY` | console.anthropic.com → API Keys |
| `ADMIN_TOKEN` | Generate: `openssl rand -hex 32` |
| `RESEND_KEY` | resend.com → API Keys (free tier is fine) |
| `ADMIN_EMAIL` | Your email (talles.tonatto@gmail.com) |

Get these ready now — the deploy script will ask for them.

---

## Deploy — First Time

From the `sao-jorge-deploy/` directory:

```bash
chmod +x deploy.sh
./deploy.sh
```

The script runs these steps automatically:
1. Checks all dependencies
2. Creates Cloudflare Queues + R2 bucket
3. Prompts for your 4 secrets and sets them
4. Runs D1 schema migrations (all 12 tables)
5. Seeds the database (24 services + Grandes Completas)
6. Uploads all 12 agent `.md` prompts to R2
7. Deploys the Workers backend
8. Builds and deploys the Next.js frontend to Cloudflare Pages
9. Triggers the first scraper run

**Total time: ~5 minutes.**

---

## After Deploy — Manual Steps

### 1. Set custom domain

In Cloudflare Dashboard:
- Go to **Workers & Pages → sao-jorge → Custom domains**
- Add: `sao-jorge.oliceu.com`
- Cloudflare auto-adds the DNS record (since oliceu.com is on Cloudflare)

### 2. Verify the Worker URL

The deploy script writes your Worker URL to `nextjs/.env.local`.
Check it looks right:

```bash
cat nextjs/.env.local
# Should show: NEXT_PUBLIC_WORKER_URL=https://sao-jorge-curitiba.YOUR_ACCOUNT.workers.dev
```

### 3. Test everything

```bash
# Test: today's liturgical data (may be empty until cron runs)
curl https://sao-jorge-curitiba.YOUR_ACCOUNT.workers.dev/api/day/today

# Test: service catalog
curl https://sao-jorge-curitiba.YOUR_ACCOUNT.workers.dev/api/services

# Test: Grandes Completas (should return sections immediately — seeded)
curl https://sao-jorge-curitiba.YOUR_ACCOUNT.workers.dev/api/services/grandes-completas

# Test: admin auth (use your ADMIN_TOKEN)
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  https://sao-jorge-curitiba.YOUR_ACCOUNT.workers.dev/api/admin/queue
```

### 4. Trigger first scraper manually

The cron runs at 3am UTC daily. To populate data now:

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  https://sao-jorge-curitiba.YOUR_ACCOUNT.workers.dev/api/admin/scrape-now
```

Then open `/admin` on your site, log in with `ADMIN_TOKEN`, and approve
the liturgical day items that appear in the review queue.

---

## Daily Operation

### What happens automatically every day at 3am UTC (midnight Brasília)

```
Cron fires
  → Scraper fetches orthocal.info + antiochian.org (8 days ahead)
  → Research Agent enriches each day (saint bio, patristic quote)
  → Translation Agent translates to PT-BR
  → Content Manager validates and writes to review queue
  → You get an email: "N items awaiting review"

You open /admin
  → Review each item (summary + flags shown)
  → Click ☩ Aprovar
  → Day data goes live on the site
```

### Adding a bulletin

1. Go to `/admin/bulletin`
2. Fill in title PT (+ AR if you have it)
3. Set publish date
4. Click ☩ Salvar Aviso

### Adding a liturgical booklet page (OCR pipeline)

1. Go to `/admin/services`
2. Select the target service from the dropdown
3. Upload the page photo (JPG/PNG)
4. The OCR pipeline queues it automatically
5. Check `/admin` for the extracted text in the review queue
6. Approve → service goes live

---

## Redeployment Commands

```bash
# Redeploy workers only (after code changes to workers/)
./deploy.sh workers

# Redeploy frontend only (after code changes to nextjs/)
./deploy.sh frontend

# Re-run migrations (after adding new SQL)
./deploy.sh db

# Update an agent's behavior WITHOUT a code deploy
# Edit agents/03-content-research.md (or any other)
./deploy.sh agents
# Changes take effect on next Worker cold start (~2 min)

# Update secrets
./deploy.sh secrets
```

---

## Updating Agent Behavior

This is the key operational pattern. The agent `.md` files in `agents/`
are stored in R2 and loaded at runtime as LLM system prompts. To change
how an agent behaves:

```bash
# Example: tighten the patristic quote verification rules
nano agents/03-content-research.md   # edit the file
./deploy.sh agents                   # re-upload to R2
# Done — no code deploy needed
```

---

## Monitoring

```bash
# Live log tail (Workers)
wrangler tail --cwd workers

# Check agent errors in D1
wrangler d1 execute sao-jorge-db --command \
  "SELECT agent, error_type, message, created_at FROM agent_errors ORDER BY created_at DESC LIMIT 20" \
  --env "" --cwd workers --remote

# Check review queue
wrangler d1 execute sao-jorge-db --command \
  "SELECT content_type, content_id, status, created_at FROM review_queue ORDER BY created_at DESC LIMIT 10" \
  --env "" --cwd workers --remote

# Check conflict log
wrangler d1 execute sao-jorge-db --command \
  "SELECT * FROM conflict_log ORDER BY created_at DESC LIMIT 10" \
  --env "" --cwd workers --remote
```

---

## Environment Variables Reference

### Workers secrets (set via `wrangler secret put`)

| Secret | Description |
|---|---|
| `ANTHROPIC_KEY` | Claude API key — used by all LLM agents |
| `ADMIN_TOKEN` | Bearer token for `/api/admin/*` routes + admin UI login |
| `RESEND_KEY` | Resend API key for review notification emails |
| `ADMIN_EMAIL` | Email to notify when review queue has items |

### Workers vars (in `wrangler.toml`, not secret)

| Var | Value |
|---|---|
| `ENVIRONMENT` | `production` |
| `TZ` | `America/Sao_Paulo` |

### Next.js env (in `nextjs/.env.local`)

| Var | Description |
|---|---|
| `NEXT_PUBLIC_WORKER_URL` | Full URL of your deployed Worker |

---

## Cloudflare Resources Created

| Resource | Name | Type |
|---|---|---|
| D1 Database | `sao-jorge-db` | Existing (ID in wrangler.toml) |
| KV Namespace | `DAY_CACHE` | Existing (ID in wrangler.toml) |
| R2 Bucket | `sao-jorge-media` | Created by deploy.sh |
| Queue | `sao-jorge-main` | Created by deploy.sh |
| Queue | `sao-jorge-ocr` | Created by deploy.sh |
| Queue | `sao-jorge-dlq` | Created by deploy.sh |
| Pages Project | `sao-jorge` | Created on first frontend deploy |

---

## Buzzsprout Podcast Setup

Update the feed URL in `workers/src/index.ts`:

```typescript
// Line ~410 in index.ts
const FEED_URL = 'https://feeds.buzzsprout.com/XXXXXXX.rss'
//                                              ↑ Replace with your Buzzsprout feed ID
```

Find your feed ID: Buzzsprout Dashboard → Directories → RSS feed URL.

Then redeploy workers:
```bash
./deploy.sh workers
```

---

## Sprint 2 Checklist (next phase)

When you're ready to expand:

- [ ] `/calendar` — monthly liturgical calendar view
- [ ] `/readings` — full trilingual lection reader  
- [ ] `/chants` — Fr. Nicholas Malek chant library
- [ ] `/blog` — long-form PT articles
- [ ] Social media agents (Instagram Graph API + YouTube Data API)
- [ ] OCR Worker (Python/Tesseract — separate Cloudflare Worker or external service)
- [ ] More service texts as booklet pages are scanned

---

☩ Slava Bohu — Deus está conosco.
