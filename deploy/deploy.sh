#!/usr/bin/env bash
# ☩ São Jorge Parish Webapp — Master Deploy Script
# Runs everything in order: infra → DB → agents to R2 → workers → frontend
#
# Usage:
#   ./deploy.sh           # full first-time deploy
#   ./deploy.sh workers   # redeploy workers only
#   ./deploy.sh frontend  # redeploy frontend only
#   ./deploy.sh db        # re-run migrations only
#   ./deploy.sh agents    # re-upload agent .md files to R2 only

set -euo pipefail

# ── Colours ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GOLD='\033[0;33m'; GREEN='\033[0;32m'; NC='\033[0m'
log()  { echo -e "${GOLD}☩  $*${NC}"; }
ok()   { echo -e "${GREEN}✓  $*${NC}"; }
err()  { echo -e "${RED}✕  $*${NC}"; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKERS_DIR="$SCRIPT_DIR/workers"
NEXTJS_DIR="$SCRIPT_DIR/nextjs"
AGENTS_DIR="$SCRIPT_DIR/agents"
MIGRATIONS_DIR="$SCRIPT_DIR/migrations"

# ─────────────────────────────────────────────────────────────────────────────

check_deps() {
  log "Checking dependencies..."
  command -v node    >/dev/null 2>&1 || err "node not found. Install: https://nodejs.org"
  command -v npm     >/dev/null 2>&1 || err "npm not found"
  command -v wrangler >/dev/null 2>&1 || err "wrangler not found. Run: npm install -g wrangler"
  # Check wrangler is authenticated
  wrangler whoami >/dev/null 2>&1 || err "Not logged in to Cloudflare. Run: wrangler login"
  ok "All dependencies present"
}

# ─────────────────────────────────────────────────────────────────────────────

setup_cloudflare_infra() {
  log "Setting up Cloudflare infrastructure..."

  # Queues
  log "Creating queues (errors OK if already exist)..."
  wrangler queues create sao-jorge-main  2>/dev/null || true
  wrangler queues create sao-jorge-ocr   2>/dev/null || true
  wrangler queues create sao-jorge-dlq   2>/dev/null || true
  ok "Queues ready"

  # R2 bucket
  log "Creating R2 bucket..."
  wrangler r2 bucket create sao-jorge-media 2>/dev/null || true
  ok "R2 bucket ready"
}

# ─────────────────────────────────────────────────────────────────────────────

set_secrets() {
  log "Setting Cloudflare Worker secrets..."
  echo ""
  echo "  You need 4 secrets. Press Enter to skip any you've already set."
  echo ""

  read -rp "  ANTHROPIC_KEY (Anthropic API key): " ANTHROPIC_KEY
  if [[ -n "$ANTHROPIC_KEY" ]]; then
    echo "$ANTHROPIC_KEY" | wrangler secret put ANTHROPIC_KEY --env "" --cwd "$WORKERS_DIR"
    ok "ANTHROPIC_KEY set"
  fi

  read -rsp "  ADMIN_TOKEN (choose a strong random string): " ADMIN_TOKEN; echo ""
  if [[ -n "$ADMIN_TOKEN" ]]; then
    echo "$ADMIN_TOKEN" | wrangler secret put ADMIN_TOKEN --env "" --cwd "$WORKERS_DIR"
    ok "ADMIN_TOKEN set"
    echo "  Save this token — you'll need it to log into /admin"
    echo "  ADMIN_TOKEN: $ADMIN_TOKEN"
  fi

  read -rp "  RESEND_KEY (Resend API key for email notifications): " RESEND_KEY
  if [[ -n "$RESEND_KEY" ]]; then
    echo "$RESEND_KEY" | wrangler secret put RESEND_KEY --env "" --cwd "$WORKERS_DIR"
    ok "RESEND_KEY set"
  fi

  read -rp "  ADMIN_EMAIL (your email for review notifications): " ADMIN_EMAIL
  if [[ -n "$ADMIN_EMAIL" ]]; then
    echo "$ADMIN_EMAIL" | wrangler secret put ADMIN_EMAIL --env "" --cwd "$WORKERS_DIR"
    ok "ADMIN_EMAIL set"
  fi
}

# ─────────────────────────────────────────────────────────────────────────────

run_migrations() {
  log "Running D1 migrations..."
  wrangler d1 execute sao-jorge-db \
    --file="$MIGRATIONS_DIR/001_schema.sql" \
    --env "" \
    --cwd "$WORKERS_DIR" \
    --remote
  ok "Schema migration complete"

  wrangler d1 execute sao-jorge-db \
    --file="$MIGRATIONS_DIR/002_seed.sql" \
    --env "" \
    --cwd "$WORKERS_DIR" \
    --remote
  ok "Seed data inserted (service catalog + grandes-completas)"

  # Sprint 2 tables (blog_posts, social_posts) — safe IF NOT EXISTS
  wrangler d1 execute sao-jorge-db \
    --file="$MIGRATIONS_DIR/007_sprint2_tables.sql" \
    --env "" \
    --cwd "$WORKERS_DIR" \
    --remote
  ok "Sprint 2 tables (blog_posts, social_posts) created"
}

# ─────────────────────────────────────────────────────────────────────────────

upload_agents() {
  log "Uploading agent prompt files to R2..."
  if [[ ! -d "$AGENTS_DIR" ]]; then
    err "Agent files not found at $AGENTS_DIR — run this from the deploy/ directory"
  fi

  for f in "$AGENTS_DIR"/*.md; do
    filename=$(basename "$f")
    log "  Uploading $filename..."
    wrangler r2 object put "sao-jorge-media/agents/$filename" \
      --file="$f" \
      --env "" \
      --cwd "$WORKERS_DIR"
  done
  ok "All agent prompts uploaded to R2"
}

# ─────────────────────────────────────────────────────────────────────────────

deploy_workers() {
  log "Installing Workers dependencies..."
  npm install --prefix "$WORKERS_DIR" --silent
  ok "Workers npm install done"

  log "Deploying Cloudflare Workers..."
  wrangler deploy --env "" --cwd "$WORKERS_DIR"
  ok "Workers deployed"

  # Grab the worker URL for Next.js env
  WORKER_URL=$(wrangler deployments list --cwd "$WORKERS_DIR" 2>/dev/null \
    | grep "workers.dev" | head -1 | awk '{print $NF}' || true)

  if [[ -n "$WORKER_URL" ]]; then
    ok "Worker URL: https://$WORKER_URL"
    echo "NEXT_PUBLIC_WORKER_URL=https://$WORKER_URL" > "$NEXTJS_DIR/.env.local"
    echo "NEXT_PUBLIC_WORKER_URL=https://$WORKER_URL" > "$NEXTJS_DIR/.env.production"
  else
    log "Could not auto-detect worker URL — set NEXT_PUBLIC_WORKER_URL manually in $NEXTJS_DIR/.env.local"
  fi
}

# ─────────────────────────────────────────────────────────────────────────────

deploy_frontend() {
  log "Installing Next.js dependencies..."
  npm install --prefix "$NEXTJS_DIR" --silent
  ok "Next.js npm install done"

  # Verify worker URL is set
  if [[ ! -f "$NEXTJS_DIR/.env.local" ]]; then
    log "No .env.local found. Creating template..."
    cat > "$NEXTJS_DIR/.env.local" << 'EOF'
# Set this to your Cloudflare Worker URL
# e.g. https://sao-jorge-curitiba.YOUR_ACCOUNT.workers.dev
NEXT_PUBLIC_WORKER_URL=https://YOUR_WORKER_URL_HERE
EOF
    err ".env.local created — set NEXT_PUBLIC_WORKER_URL then re-run: ./deploy.sh frontend"
  fi

  log "Building Next.js for Cloudflare Pages..."
  cd "$NEXTJS_DIR"
  npm run pages:build

  log "Deploying to Cloudflare Pages..."
  wrangler pages deploy .vercel/output/static \
    --project-name=sao-jorge \
    --branch=main
  cd "$SCRIPT_DIR"
  ok "Frontend deployed to Cloudflare Pages"

  # Set custom domain reminder
  echo ""
  echo -e "${GOLD}  Next step: Set up custom domain in Cloudflare Pages dashboard${NC}"
  echo "  Pages project: sao-jorge"
  echo "  Custom domain: sao-jorge.oliceu.com"
  echo "  DNS: add CNAME record pointing sao-jorge.oliceu.com → sao-jorge.pages.dev"
}

# ─────────────────────────────────────────────────────────────────────────────

trigger_first_scrape() {
  log "Triggering first scraper run to populate today's data..."
  WORKER_URL=$(cat "$NEXTJS_DIR/.env.local" 2>/dev/null | grep NEXT_PUBLIC_WORKER_URL | cut -d= -f2 || echo "")
  ADMIN_TOKEN=$(wrangler secret get ADMIN_TOKEN --cwd "$WORKERS_DIR" 2>/dev/null || echo "")

  if [[ -n "$WORKER_URL" ]] && [[ -n "$ADMIN_TOKEN" ]]; then
    curl -s -X POST "$WORKER_URL/api/admin/scrape-now" \
      -H "Authorization: Bearer $ADMIN_TOKEN" >/dev/null && ok "Scraper triggered" || true
  else
    log "Could not auto-trigger scraper — visit /admin or wait for cron at 3am UTC"
  fi
}

# ─────────────────────────────────────────────────────────────────────────────

print_summary() {
  echo ""
  echo -e "${GOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GOLD}  ☩ São Jorge Parish Webapp — Deploy Complete${NC}"
  echo -e "${GOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo "  Frontend:  https://sao-jorge.oliceu.com"
  echo "  Admin:     https://sao-jorge.oliceu.com/admin"
  echo "  Workers:   https://sao-jorge-curitiba.YOUR_ACCOUNT.workers.dev"
  echo ""
  echo "  Daily cron runs at 3am UTC (midnight Brasília)"
  echo "  Review queue: check /admin after each cron run"
  echo ""
  echo "  To update an agent prompt without code deploy:"
  echo "    ./deploy.sh agents"
  echo ""
  echo -e "${GOLD}  ☩ Slava Bohu${NC}"
  echo ""
}

# ─────────────────────────────────────────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────────────────────────────────────────

MODE="${1:-full}"

case "$MODE" in
  full)
    check_deps
    setup_cloudflare_infra
    set_secrets
    run_migrations
    upload_agents
    deploy_workers
    deploy_frontend
    trigger_first_scrape
    print_summary
    ;;
  workers)
    check_deps
    deploy_workers
    ok "Workers redeployed"
    ;;
  frontend)
    check_deps
    deploy_frontend
    ok "Frontend redeployed"
    ;;
  db)
    check_deps
    run_migrations
    ok "Migrations complete"
    ;;
  agents)
    check_deps
    upload_agents
    ok "Agent prompts updated in R2"
    ;;
  secrets)
    check_deps
    set_secrets
    ok "Secrets updated"
    ;;
  *)
    echo "Usage: ./deploy.sh [full|workers|frontend|db|agents|secrets]"
    exit 1
    ;;
esac
