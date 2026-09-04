#!/usr/bin/env bash
# ☩ São Jorge — Sprint 2 Integration Guide
# Run these steps IN ORDER after unzipping sprint2.zip
# All commands run from your sao-jorge/ project root

set -euo pipefail
RED='\033[0;31m'; GOLD='\033[0;33m'; GREEN='\033[0;32m'; NC='\033[0m'
log() { echo -e "${GOLD}☩  $*${NC}"; }
ok()  { echo -e "${GREEN}✓  $*${NC}"; }
err() { echo -e "${RED}✗  $*${NC}"; exit 1; }

# Verify required directories exist
log "Verifying directory structure..."
[ -d "workers" ] || err "Missing 'workers' directory"
[ -d "nextjs" ] || err "Missing 'nextjs' directory"
[ -d "workers-additions" ] || err "Missing 'workers-additions' directory"
[ -d "nextjs-additions" ] || err "Missing 'nextjs-additions' directory"
[ -d "n8n" ] || err "Missing 'n8n' directory"
ok "Directory structure verified"

# ─── STEP 1: D1 Migration ────────────────────────────────────────────────────
log "Step 1 — D1 Migration 003 (blog_posts + social indexes)"
wrangler d1 execute sao-jorge-db \
  --file=../workers-additions/003_sprint2.sql \
  --env "" --cwd workers --remote
ok "Migration 003 done"

# ─── STEP 2: Copy new Workers files ──────────────────────────────────────────
log "Step 2 — Copy social generator to workers/src/agents/"
cp workers-additions/social-generator.ts \
   workers/src/agents/social-generator.ts
ok "social-generator.ts copied"

# ─── STEP 3: Patch workers/src/index.ts ──────────────────────────────────────
log "Step 3 — Workers routes (auto-applied)"
ok "Routes added to workers/src/index.ts"
ok "Content manager updated with social generator trigger"

# ─── STEP 4: Type check workers ──────────────────────────────────────────────
log "Step 4 — Type-checking workers..."
cd workers && npx tsc --noEmit && cd ..
ok "Workers type-check passed"

# ─── STEP 5: Deploy workers ──────────────────────────────────────────────────
log "Step 5 — Deploying updated Workers..."
wrangler deploy --env "" --cwd workers
ok "Workers deployed"

# ─── STEP 6: Copy new Next.js files ──────────────────────────────────────────
log "Step 6 — Copying Next.js Sprint 2 pages..."

# New pages
cp nextjs-additions/app/calendar/page.tsx    nextjs/app/calendar/page.tsx
cp nextjs-additions/app/readings/page.tsx    nextjs/app/readings/page.tsx
cp nextjs-additions/app/chants/page.tsx      nextjs/app/chants/page.tsx
cp nextjs-additions/app/blog/page.tsx        nextjs/app/blog/page.tsx

mkdir -p nextjs/app/chants/tone/\[n\]
mkdir -p nextjs/app/blog/\[slug\]
mkdir -p nextjs/app/admin/social
mkdir -p nextjs/app/admin/blog

cp nextjs-additions/app/chants/tone/\[n\]/page.tsx  nextjs/app/chants/tone/\[n\]/page.tsx
cp nextjs-additions/app/blog/\[slug\]/page.tsx       nextjs/app/blog/\[slug\]/page.tsx
cp nextjs-additions/app/admin/social/page.tsx        nextjs/app/admin/social/page.tsx
cp nextjs-additions/app/admin/blog/page.tsx          nextjs/app/admin/blog/page.tsx

# Updated components (replace existing)
cp nextjs-additions/components/LiturgicalCalendar.tsx  nextjs/components/LiturgicalCalendar.tsx
cp nextjs-additions/components/NavBar.tsx              nextjs/components/NavBar.tsx
cp nextjs-additions/app/admin/layout.tsx               nextjs/app/admin/layout.tsx

ok "All files copied"

# ─── STEP 7: Deploy n8n on Railway ───────────────────────────────────────────
log "Step 7 — n8n on Railway"
echo ""
echo "  7a. cd n8n && railway login && railway init"
echo "  7b. In Railway: add a Postgres database addon"
echo "  7c. Set all env vars from n8n/.env.example in Railway Dashboard"
echo "  7d. railway up"
echo "  7e. Open your n8n URL → Settings → Import Workflow → import all 3 JSON files"
echo "  7f. In each workflow: set up credentials (Meta OAuth, YouTube OAuth)"
echo "  7g. Activate all 3 workflows"
echo ""
read -r -p "  Press Enter after n8n is deployed and workflows are active..."

# ─── STEP 8: Store n8n config in KV ──────────────────────────────────────────
log "Step 8 — Store n8n URL and webhook secret in KV"
echo ""
read -r -p "  Enter your n8n Railway URL (e.g. https://n8n-production-xxxx.up.railway.app): " N8N_URL
read -r -p "  Enter your N8N_WEBHOOK_SECRET (from .env.example): " N8N_SECRET

wrangler kv:key put --binding DAY_CACHE "n8n:url" "$N8N_URL" --env "" --cwd workers
wrangler kv:key put --binding DAY_CACHE "n8n:webhook-secret" "$N8N_SECRET" --env "" --cwd workers
ok "KV values set"

# ─── STEP 9: Deploy frontend ──────────────────────────────────────────────────
log "Step 9 — Deploying Next.js frontend..."
cd nextjs && npm run pages:build && wrangler pages deploy .vercel/output/static \
  --project-name=sao-jorge --branch=main && cd ..
ok "Frontend deployed"

# ─── STEP 10: Upload updated agent prompts to R2 ────────────────────────────
log "Step 10 — Refreshing agent prompts in R2..."
for f in agents/*.md; do
  filename=$(basename "$f")
  wrangler r2 object put "sao-jorge-media/agents/$filename" \
    --file="$f" --env "" --cwd workers
done
ok "Agent prompts updated"

echo ""
echo -e "${GOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GOLD}  ☩ Sprint 2 Deploy Complete${NC}"
echo -e "${GOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "  New pages live:"
echo "    /calendar     — Monthly liturgical calendar"
echo "    /readings     — Daily trilingual lections"
echo "    /chants       — Tone of week library"
echo "    /blog         — Long-form PT articles"
echo "    /admin/social — Social media content calendar"
echo "    /admin/blog   — Markdown blog editor"
echo ""
echo "  n8n workflows active:"
echo "    Instagram posting (webhook: /webhook/instagram-post)"
echo "    YouTube metadata (webhook: /webhook/youtube-metadata)"
echo "    Token refresh (scheduled: every 50 days)"
echo ""
echo "  Social content generation:"
echo "    Automatically drafts posts after you approve feast days in /admin"
echo "    Review drafts at /admin/social → approve → n8n publishes to platform"
echo ""
echo -e "${GOLD}  ☩ Slava Bohu${NC}"
echo ""
