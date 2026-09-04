# ☩ São Jorge Parish Webapp — Workers Backend
## Bootstrap Guide

---

## Prerequisites

```bash
npm install -g wrangler
wrangler login
```

---

## 1. First-time infrastructure setup

Run once to create all Cloudflare resources:

```bash
npm install

# Create queues
npm run queue:create

# Create R2 bucket
npm run r2:create
```

---

## 2. Set secrets

```bash
wrangler secret put ANTHROPIC_KEY    # Your Anthropic API key
wrangler secret put ADMIN_TOKEN      # Choose a strong random string (use: openssl rand -hex 32)
wrangler secret put RESEND_KEY       # Your Resend API key
wrangler secret put ADMIN_EMAIL      # talles.tonatto@gmail.com
```

---

## 3. Run D1 migrations

```bash
# Production
npm run db:migrate
npm run db:seed

# Dev
npm run db:migrate:dev
npm run db:seed:dev   # (after copying seed script)
```

---

## 4. Upload agent prompts to R2

The Workers pull agent .md files from R2 at runtime.
This allows updating agent behavior without redeploying code.

```bash
# Upload all agent files to R2
for f in ../agents/sao-jorge/*.md; do
  wrangler r2 object put sao-jorge-media/agents/$(basename $f) --file=$f
done
```

---

## 5. Deploy

```bash
# Deploy to production
npm run deploy

# Deploy to dev
npm run deploy:dev
```

---

## 6. Verify

```bash
# Tail live logs
npm run logs

# Test scraper manually (triggers the cron handler)
curl https://sao-jorge-curitiba.YOUR_SUBDOMAIN.workers.dev/api/day/today

# Test admin auth
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  https://sao-jorge-curitiba.YOUR_SUBDOMAIN.workers.dev/api/admin/queue
```

---

## Data Flow Summary

```
Every day at 3am UTC (midnight Brasília):

  [Cron]
    → runScraper()
        → orthocal.info API (8 days ahead)
        → antiochian.org/liturgicday (today only)
        → upsert to D1 liturgical_days_raw
        → emit SCRAPER_DONE to sao-jorge-main queue

  [Queue: sao-jorge-main] receives SCRAPER_DONE
    → runResearchAgent(date)   ┐  parallel
    → runTranslationAgent(date) ┘
        → both call Claude API (Opus for quality)
        → write enrichment + PT translations back to D1
        → emit RESEARCH_DONE + TRANSLATION_DONE

  [Queue: sao-jorge-main] receives RESEARCH_DONE / TRANSLATION_DONE
    → handleResearchDone / handleTranslationDone
        → check if pair is complete (both done)
        → consolidate: validate, build summary, write to review_queue
        → schedule admin notification

  [Cron end] flushAdminNotification()
    → one email to Timon: "N items awaiting review"

  [Timon reviews in Admin UI]
    → POST /api/admin/approve → emit ADMIN_APPROVED
    → handleAdminApproved()
        → snapshot to liturgical_days (published table)
        → invalidate KV cache
        → service_catalog.available = 1 (for service texts)
```

---

## Manual Triggers

```bash
# Manually trigger scraper for today (useful in dev)
curl -X POST -H "Authorization: Bearer TOKEN" \
  https://YOUR_WORKER/api/admin/scrape-now

# Upload a booklet page for OCR
curl -X POST -H "Authorization: Bearer TOKEN" \
  -F "file=@l0021.jpg" \
  -F "slug=divina-liturgia-crisostomo" \
  https://YOUR_WORKER/api/admin/upload
```

---

## Updating Agent Behavior (no code deploy needed)

To change how an agent behaves (e.g., update the patristic quote selection
rules in Agent 03), just re-upload the .md file to R2:

```bash
wrangler r2 object put sao-jorge-media/agents/03-content-research.md \
  --file=../agents/sao-jorge/03-content-research.md
```

The Worker caches prompts in memory per instance — changes take effect
on the next Worker cold start (within minutes).
