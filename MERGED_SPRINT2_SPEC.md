# ☩ São Jorge Parish Webapp — Sprint 2 Specification
## Igreja Ortodoxa Antioquena de Curitiba

---

## Overview

Sprint 1 delivered: service viewer, homepage, bulletin, podcast, admin queue, OCR upload pipeline, Cloudflare Workers backend with daily scraper.

Sprint 2 delivers everything that makes the site a complete living parish platform:

| Feature | Complexity | Value |
|---|---|---|
| `/calendar` — Monthly liturgical calendar | Medium | High |
| `/readings` — Daily trilingual lection reader | Medium | High |
| `/chants` — Fr. Nicholas Malek library | Medium | High |
| `/blog` — Long-form PT articles | Low | Medium |
| Instagram integration (Graph API) | High | High |
| YouTube integration (Data API) | Medium | Medium |
| OCR Worker (Python/Tesseract) | High | Critical |

---

## Feature 1 — `/calendar` Monthly Liturgical Calendar

### What it is
A full-month grid showing every day's feast level, fast type, and tone. Tap a day → see the `LiturgicalDayCard` for that date. Navigable month by month.

### Frontend

**Route:** `app/calendar/page.tsx` (Server Component)

**Component: `<LiturgicalCalendar />`**

```
Layout: CSS grid, 7 columns (Sun–Sat)
Each cell:
  - Day number
  - Feast indicator dot (color by feastLevel)
  - Feast name (truncated to 1 line, font-display, small)
  - Fast icon (✦ if fasting)
  - Tone pill if Sunday
  - Click → opens LiturgicalDayCard in modal or navigates to /readings?date=YYYY-MM-DD

Mobile: same grid, cells smaller, feast name hidden below 480px — tap to expand
```

**Feast level color coding:**
```
0–1  Feria/minor    → text-muted dot
2–3  Polyeleos      → accent-gold dot
4–5  Great Feast    → accent-red dot + bold name
6    Pascha          → accent-red dot + gold ring
```

**Navigation:**
```
← Mês anterior     |  Abril 2026  |  Próximo mês →
```
Month nav uses `?month=YYYY-MM` query param — Server Component reads it, no client state needed.

### Backend — new API route

```
GET /api/calendar?month=YYYY-MM
```

Fetches all published `liturgical_days` rows for the month from D1, returns array. Falls back to orthocal.info for any missing dates (scraper may not have run that far ahead yet).

```typescript
// workers/src/index.ts — add handler
async function handleCalendarMonth(month: string, env: Env): Promise<Response> {
  // month = "2026-04"
  const [y, m] = month.split('-')
  const startDate = `${y}-${m}-01`
  const endDate   = `${y}-${m}-31`  // D1 handles overflow correctly

  const cached = await env.DAY_CACHE.get(`calendar:${month}`)
  if (cached) return jsonResponse(JSON.parse(cached))

  const rows = await env.DB.prepare(`
    SELECT date, data FROM liturgical_days
    WHERE date >= ? AND date <= ?
    ORDER BY date ASC
  `).bind(startDate, endDate).all()

  const result = rows.results.map(r => JSON.parse(r.data as string))
  await env.DAY_CACHE.put(`calendar:${month}`, JSON.stringify(result), { expirationTtl: 86400 })
  return jsonResponse(result)
}
```

**KV key:** `calendar:YYYY-MM`, TTL 24h. Invalidated whenever a day in that month is approved.

---

## Feature 2 — `/readings` Daily Trilingual Lection Reader

### What it is
Full epistle and gospel text for any given day, displayed in three panels: Arabic (right-to-left), Portuguese, English. Text sourced from DCS (Greek Orthodox lection texts — the same pericopes, just the Antiochian lectionary assignments differ slightly).

### Frontend

**Route:** `app/readings/page.tsx`

```
URL: /readings                    → today's readings
URL: /readings?date=YYYY-MM-DD   → specific date

Layout:
  LiturgicalDayCard (compact — feast name + date only, no quote)
  
  Tabs: Epístola | Evangelho
  
  Language toggle: PT | AR | EN  (same TrilingualToggle component)
  
  Reading panel:
    Pericope name (italic, font-display, text-muted)
    Book + chapter:verse reference (small, font-ui)
    Text body (font-serif, lh-pt / font-arabic lh-ar for AR)
    
  Previous day ← | → Next day navigation
```

**Data source for lection text:**

The orthocal.info API already returns the epistle/gospel references in `LectionRef` format but `textPt` and `textAr` are null — those come from two separate sources:

- **Portuguese:** No complete freely available PT Orthodox Bible. Options:
  1. João Ferreira de Almeida (public domain) — close enough register
  2. Manual entry for key pericopes (priority: Sunday gospels + epistle)
  3. Long term: PT Translation Agent translates from EN text

- **Arabic:** DCS (digitalchurchservices.com) has Arabic lection texts. Scraper fetches these.

- **English:** orthocal.info provides EN text already in the API response (`passage` field has the reference, full text fetchable from Bible API).

**For Sprint 2 scope:** Display EN text (from Bible API) and PT text (Almeida, free API available). Arabic text from DCS scraper — add to Scraper Agent source list.

### Backend — lection text fetcher

Add to scraper pipeline — after orthocal fetch, enrich epistle/gospel with full text:

```typescript
// New source: api.bible or getbible.net for EN text
async function fetchLectionText(ref: LectionRef): Promise<string | null> {
  const { bookCode, chapter, verseStart, verseEnd } = ref
  const url = `https://bible-api.com/${bookCode}+${chapter}:${verseStart}-${verseEnd}?translation=web`
  const resp = await fetch(url)
  if (!resp.ok) return null
  const data = await resp.json() as any
  return data.text ?? null
}
```

**New API route:**
```
GET /api/readings?date=YYYY-MM-DD
```
Returns the full `LiturgicalDay` with populated `epistle.textEn`, `gospel.textEn`, and `epistle.textPt`, `gospel.textPt` where available.

---

## Feature 3 — `/chants` Tone of Week Library

### What it is
The eight tones of the Octoechos, with chant texts from Fr. Nicholas Malek's website. Current tone highlighted. Each tone shows: Resurrectional Troparion, Resurrectional Kontakion, Theotokion, and any feast-specific variants.

### Frontend

**Route:** `app/chants/page.tsx`

```
Layout:
  "Tom desta semana: N" — hero banner (gold background if current tone)
  
  Tone grid: 8 cards, 4×2
    Each card:
      "Tom N" (large, font-display)
      Arabic: "اللحن N"
      Click → expands or navigates to /chants/tone/N
  
  /chants/tone/[n]:
    Tone N heading
    Tabs: Tropário | Kondákion | Theotókion | Outros
    Each tab:
      PT text (font-serif)
      AR text (font-arabic, rtl)
      Source credit: "Pe. Nicholas Malek"
```

**Current tone logic:**
Tone of week = `LiturgicalDay.toneOfWeek` from today's data. Display with gold border/background.

### Backend — Fr. Nicholas Malek scraper

**New source added to Scraper Agent (Agent 02):**

```typescript
// Run weekly (Sunday cron, or add second cron trigger "0 6 * * 0")
async function scrapeNicholasMalek(env: Env): Promise<void> {
  // Fr. Malek publishes chant texts at frnicholasmalek.com
  // Target: tone pages + any PDF downloads
  
  const BASE = 'https://frnicholasmalek.com'
  
  // Fetch tone index page
  const resp = await fetch(`${BASE}/tones`, {
    headers: { 'User-Agent': 'SaoJorgeParish/1.0' }
  })
  
  // Parse HTML for tone text blocks and PDF links
  // PDF links → emit OCR_NEEDED event to OCR queue
  // Text blocks → write directly to chants table (pending status)
}
```

**New D1 query:**
```sql
SELECT slug, title_pt, title_ar, tone, occasion, text_pt, text_ar, source_url
FROM chants
WHERE tone = ? AND status = 'published'
ORDER BY occasion ASC
```

**KV cache:** `chants:tone-N`, TTL 7 days. Already implemented in Sprint 1 workers.

---

## Feature 4 — `/blog`

### What it is
Long-form PT articles: feast explainers, saint profiles, patristic reflections. Generated by Social Media Subagent 08a, reviewed by Timon, published manually.

### Frontend

**Routes:**
- `app/blog/page.tsx` — article list
- `app/blog/[slug]/page.tsx` — article detail

```
/blog list:
  Article cards (reverse chronological)
    Featured image (if set, else Byzantine cross graphic)
    Title (font-display, accent-red)
    Excerpt (first 150 chars of body, font-serif, text-secondary)
    Date + estimated read time
    Tag chips

/blog/[slug]:
  Article header: title + date + author line ("Paróquia São Jorge")
  Body: Markdown rendered to HTML
    h2/h3 → font-display, accent-red
    p → font-serif, lh-pt
    blockquote → left border accent-gold, italic (for patristic quotes)
  Related articles (same tags, max 3)
```

### Backend — blog table (new D1 table)

```sql
-- Migration 003: Blog articles
CREATE TABLE IF NOT EXISTS blog_posts (
  slug        TEXT PRIMARY KEY,
  title_pt    TEXT NOT NULL,
  excerpt_pt  TEXT,
  body_pt     TEXT NOT NULL,   -- Markdown
  tags        TEXT,            -- JSON string[]
  author      TEXT DEFAULT 'Paróquia São Jorge',
  published_at TEXT,
  status      TEXT DEFAULT 'draft'
              CHECK (status IN ('draft', 'published', 'archived')),
  created_at  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_blog_status ON blog_posts(status, published_at);
```

**New API routes:**
```
GET /api/blog              → published posts list (last 20)
GET /api/blog/[slug]       → single post
POST /api/admin/blog       → create/update post
```

### Admin UI — `/admin/blog`

Simple Markdown editor (textarea — no rich text needed for V1):
- Title PT input
- Body PT textarea (Markdown)
- Tags input (comma-separated)
- Publish date picker
- Status toggle: Draft / Publish

**Social Agent integration:** When Subagent 08a generates a blog draft, it writes to `social_posts` table with `platform = 'blog'`. The `/admin/social` page shows it. Timon approves → it moves to `blog_posts` with status `draft`. Timon then publishes from `/admin/blog`.

---

## Feature 5 — Instagram Graph API Integration

### Architecture

Instagram posting goes through a **separate n8n workflow** (as discussed — this is the right place for n8n, connecting SaaS APIs, not the core liturgical pipeline). The Workers backend generates the content; n8n handles the platform posting.

```
Workers (content generation)
  → social_posts table: { platform: 'instagram', content: {...}, status: 'approved' }

Webhook from /api/admin/social/publish
  → n8n workflow trigger

n8n workflow:
  → Receive content JSON
  → If image needed: call image generation API (or use pre-made icon)
  → Post to Instagram Graph API
  → Webhook back to Workers: mark social_post as 'published'
```

### Setup steps

**Step 1 — Instagram Business Account**

Your Instagram account must be a **Business** or **Creator** account (not Personal).
Settings → Account type → Switch to Professional Account → Business.

**Step 2 — Facebook Page**

Instagram Graph API requires a linked Facebook Page.
- Create a Facebook Page for São Jorge (if not already exists)
- Link it: Instagram Settings → Linked accounts → Facebook

**Step 3 — Meta Developer App**

```
1. Go to developers.facebook.com
2. Create App → Business type
3. Add product: Instagram Graph API
4. Add your Instagram account to the app
5. Generate a long-lived User Access Token:
   - Permissions needed: instagram_basic, instagram_content_publish,
     instagram_manage_insights, pages_read_engagement
6. Exchange for long-lived token (60-day expiry — must refresh)
```

**Step 4 — Get your Instagram Business Account ID**

```bash
# Replace YOUR_TOKEN with your access token
curl "https://graph.facebook.com/v21.0/me/accounts?access_token=YOUR_TOKEN"
# → Get page_id

curl "https://graph.facebook.com/v21.0/YOUR_PAGE_ID?fields=instagram_business_account&access_token=YOUR_TOKEN"
# → Get instagram_business_account.id — save this as IG_BUSINESS_ID
```

**Step 5 — n8n Instagram workflow**

```
Trigger: Webhook POST /webhook/instagram-post

Nodes:
  1. Webhook (receives content JSON from Workers)
  2. IF: has image URL?
     YES → HTTP Request: upload image container
       POST https://graph.facebook.com/v21.0/{IG_BUSINESS_ID}/media
       { image_url, caption, access_token }
     NO → HTTP Request: text-only not supported on Instagram
           → use default feast cross image from R2
  3. HTTP Request: publish the container
       POST https://graph.facebook.com/v21.0/{IG_BUSINESS_ID}/media_publish
       { creation_id, access_token }
  4. HTTP Request: notify Workers of success
       POST https://YOUR_WORKER/api/admin/social/published
       { social_post_id, platform: 'instagram', platform_post_id }
```

**Token refresh automation** (add as n8n scheduled workflow):
```
Every 50 days:
  GET https://graph.facebook.com/v21.0/oauth/access_token
    ?grant_type=fb_exchange_token
    &client_id=YOUR_APP_ID
    &client_secret=YOUR_APP_SECRET
    &fb_exchange_token=CURRENT_TOKEN
  → Update token in n8n credentials
```

### Workers changes for Instagram

**New secret:** `N8N_WEBHOOK_URL` — your n8n instance URL.

**New API route:**
```
POST /api/admin/social/publish   → triggers n8n webhook with content
POST /api/admin/social/published → n8n calls back to mark as published
```

**Social post content schema for Instagram:**
```typescript
interface InstagramPostContent {
  caption:     string       // PT caption with hashtags
  imagePrompt: string | null // for AI image generation if no icon
  imageUrl:    string | null // R2 URL if pre-made
  hashtags:    string[]
  scheduledAt: string | null
}
```

### Admin UI — `/admin/social`

New page showing the social media calendar:

```
Week view: Mon–Sun
Each day:
  Liturgical day name
  Draft posts for that day:
    Instagram draft → [Preview] [Edit] [Approve + Schedule]
    Blog draft      → [Preview] [Edit] [Approve]
    YouTube draft   → [Preview] [Edit] [Approve]

Approved posts show scheduled time and platform icon.
Published posts show ✓ with timestamp.
```

---

## Feature 6 — YouTube Data API Integration

### Architecture

Same pattern as Instagram — Workers generates content, n8n posts via YouTube Data API.

### Setup steps

**Step 1 — YouTube channel**
Already created. Get the Channel ID:
YouTube Studio → Customization → Basic info → Channel URL → the string after `/channel/` or use:
```
https://www.googleapis.com/youtube/v3/channels?part=id&mine=true&access_token=YOUR_TOKEN
```

**Step 2 — Google Cloud Project**

```
1. console.cloud.google.com → New Project "sao-jorge-parish"
2. APIs & Services → Enable: YouTube Data API v3
3. Credentials → OAuth 2.0 Client ID (Web application)
4. Authorized redirect URIs: your n8n instance URL + /rest/oauth2-credential/callback
5. Download client credentials JSON
```

**Step 3 — OAuth in n8n**

```
n8n → Settings → Credentials → New → Google OAuth2 API
Paste client_id + client_secret
Scopes: https://www.googleapis.com/auth/youtube.upload
         https://www.googleapis.com/auth/youtube
Connect → authorize in browser → credentials stored
```

**Step 4 — n8n YouTube workflow**

For **video description + metadata updates** (main use case — you record liturgy, upload manually, n8n updates the metadata):

```
Trigger: Webhook POST /webhook/youtube-metadata

Nodes:
  1. Webhook (receives video_id + metadata JSON)
  2. YouTube node (built into n8n):
       Update Video
       video_id: {{ $json.video_id }}
       title:    {{ $json.title }}
       description: {{ $json.description }}
       tags:     {{ $json.tags }}
  3. HTTP Request: notify Workers of update
```

For **Shorts upload** (60s catechetical scripts Timon records):

```
Trigger: Webhook POST /webhook/youtube-upload

Nodes:
  1. Webhook (receives video file URL from R2)
  2. HTTP Request: download from R2
  3. YouTube node: Upload Video
       title, description, tags, category (29 = Nonprofits & Activism)
       privacy: 'public' or 'unlisted' (configurable)
  4. Notify Workers
```

### YouTube content schema:

```typescript
interface YouTubeVideoContent {
  videoId:      string | null    // null = new upload
  title:        string
  description:  string           // full description with chapter markers
  tags:         string[]
  chapters:     ChapterMarker[]  // Timon fills timestamps manually after recording
  playlistId:   string | null
  isShort:      boolean
}

interface ChapterMarker {
  timeCode:  string    // "00:00", "05:23" etc
  label:     string    // "Entrada", "Epístola", etc
  filled:    boolean   // false = placeholder Timon fills in
}
```

---

## Feature 7 — OCR Worker (Python/Tesseract)

### Why it's separate

The OCR pipeline (PIL, Tesseract, numpy) can't run in Cloudflare Workers — it needs a real Python runtime. Options:

**Option A — Cloudflare Workers AI (recommended)**
Cloudflare has OCR via Workers AI (`@cf/microsoft/trocr-base-printed`). No Python needed, stays in the Cloudflare stack. Limited to printed text (your booklet qualifies). Free tier: 10,000 neurons/day.

**Option B — Railway Python service**
Deploy a FastAPI service on Railway (you already know this stack from Qamareth). Gets full Tesseract with Arabic language pack. $5/month.

**Option C — Modal.com**
Serverless Python functions. Pay per use. Tesseract + PIL + Arabic model. Zero cold start cost when idle.

**Recommendation: Option A first** (Cloudflare AI), fall back to Option B if quality insufficient for Arabic.

### Option A — Cloudflare Workers AI OCR

```typescript
// Add to workers/src/agents/ocr-worker.ts
export async function runOcrOnImage(
  imageBuffer: ArrayBuffer,
  env: Env
): Promise<{ leftColumn: string; rightColumn: string }> {
  // Split image at midpoint
  // For each half, call Workers AI OCR
  
  const result = await env.AI.run('@cf/microsoft/trocr-base-printed', {
    image: [...new Uint8Array(imageBuffer)]
  })
  
  return { leftColumn: result.text, rightColumn: result.text }
}
```

Add to `wrangler.toml`:
```toml
[ai]
binding = "AI"
```

**Limitation:** Workers AI TrOCR is English/Latin-only. For Arabic we need Option B.

### Option B — Railway FastAPI OCR Service

```python
# ocr_service/main.py
from fastapi import FastAPI, UploadFile
from PIL import Image, ImageEnhance
import pytesseract
import io, json

app = FastAPI()

@app.post("/ocr")
async def process_liturgikon_spread(file: UploadFile):
    img = Image.open(io.BytesIO(await file.read()))
    w, h = img.size
    
    # Split at center
    ar_half = img.crop((0, 0, w//2, h)).convert('L')
    pt_half = img.crop((w//2, 0, w, h)).convert('L')
    
    # Enhance contrast
    ar_half = ImageEnhance.Contrast(ar_half).enhance(1.5)
    pt_half = ImageEnhance.Contrast(pt_half).enhance(1.5)
    
    ar_text = pytesseract.image_to_data(
        ar_half, lang='ara', config='--psm 6 --oem 3',
        output_type=pytesseract.Output.DICT
    )
    pt_text = pytesseract.image_to_data(
        pt_half, lang='por', config='--psm 6 --oem 3',
        output_type=pytesseract.Output.DICT
    )
    
    return {
        "ar": extract_blocks(ar_text),
        "pt": extract_blocks(pt_text)
    }
```

```dockerfile
# ocr_service/Dockerfile
FROM python:3.11-slim
RUN apt-get update && apt-get install -y tesseract-ocr tesseract-ocr-ara tesseract-ocr-por
RUN pip install fastapi uvicorn pytesseract pillow python-multipart
COPY main.py .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Deploy to Railway:
```bash
railway login
railway init   # in ocr_service/ directory
railway up
# → get URL: https://ocr-service-XXXX.up.railway.app
```

Add to Workers secrets:
```bash
wrangler secret put OCR_SERVICE_URL --env "" --cwd workers
# value: https://ocr-service-XXXX.up.railway.app
```

Workers OCR handler then calls this service:
```typescript
async function callOcrService(fileBuffer: ArrayBuffer, env: Env) {
  const form = new FormData()
  form.append('file', new Blob([fileBuffer]))
  const resp = await fetch(`${env.OCR_SERVICE_URL}/ocr`, { method: 'POST', body: form })
  return resp.json()
}
```

---

## Sprint 2 — D1 Migrations

```sql
-- Migration 003: Blog posts
CREATE TABLE IF NOT EXISTS blog_posts (
  slug         TEXT PRIMARY KEY,
  title_pt     TEXT NOT NULL,
  excerpt_pt   TEXT,
  body_pt      TEXT NOT NULL,
  tags         TEXT,
  author       TEXT DEFAULT 'Paróquia São Jorge',
  published_at TEXT,
  status       TEXT DEFAULT 'draft'
               CHECK (status IN ('draft','published','archived')),
  created_at   TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_blog_pub ON blog_posts(status, published_at);

-- Migration 004: Social posts (already in schema, adding index)
CREATE INDEX IF NOT EXISTS idx_social_platform ON social_posts(platform, status, scheduled_at);

-- Migration 005: KV cache invalidation log (debugging helper)
CREATE TABLE IF NOT EXISTS cache_invalidations (
  id         TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  cache_key  TEXT NOT NULL,
  reason     TEXT,
  created_at TEXT NOT NULL
);
```

---

## Sprint 2 — New API Routes Summary

```
# Calendar
GET  /api/calendar?month=YYYY-MM

# Readings
GET  /api/readings?date=YYYY-MM-DD

# Blog
GET  /api/blog
GET  /api/blog/:slug
POST /api/admin/blog

# Social
GET  /api/admin/social               → social posts calendar
POST /api/admin/social/publish       → trigger n8n webhook
POST /api/admin/social/published     → n8n callback to mark published

# OCR (internal — called by queue consumer)
# No public route — triggered by UPLOAD_RECEIVED queue event
```

---

## Sprint 2 — New Frontend Routes

```
app/
├── calendar/
│   └── page.tsx              ← Monthly calendar grid
├── readings/
│   └── page.tsx              ← Daily lections trilingual
├── chants/
│   ├── page.tsx              ← Tone overview (8 cards)
│   └── tone/
│       └── [n]/
│           └── page.tsx      ← Specific tone chant texts
└── blog/
    ├── page.tsx              ← Article list
    └── [slug]/
        └── page.tsx          ← Article detail

app/admin/
├── blog/
│   └── page.tsx              ← Markdown editor
└── social/
    └── page.tsx              ← Social media calendar
```

---

## Sprint 2 — Build Order

Do these in strict order — each one unblocks the next.

### Week 1 — Data layer

1. Run migration 003 (`blog_posts` table)
2. Add `/api/calendar` and `/api/readings` routes to Workers → `./deploy.sh workers`
3. Add `/api/blog` routes → `./deploy.sh workers`
4. Add Fr. Nicholas Malek to scraper → test scrape → verify chants appear in D1

### Week 2 — Frontend

5. Build `/calendar` page + `LiturgicalCalendar` component
6. Build `/readings` page + lection text fetcher
7. Build `/chants` pages
8. Build `/blog` list + detail pages
9. Build `/admin/blog` Markdown editor

### Week 3 — OCR Worker

10. Try Cloudflare AI OCR on a test booklet image → evaluate Arabic quality
11. If quality insufficient: deploy Railway OCR service
12. Wire OCR queue consumer to call the service
13. Test full pipeline: upload → OCR → alignment → review queue → approve → live

### Week 4 — Social Media

14. Set up Meta Developer App → get IG credentials
15. Set up Google Cloud → get YouTube credentials
16. Deploy n8n (Railway or self-hosted) → configure both workflows
17. Build `/admin/social` calendar page
18. Test full social pipeline: scraper → agent → draft → approve → n8n → platform

---

## What You Need Before We Start Building

Before the first line of Sprint 2 code:

**Instagram:**
- Instagram Business Account ID (see setup step 4 above)
- Meta App ID + App Secret (from developers.facebook.com)
- Long-lived access token

**YouTube:**
- YouTube Channel ID (from YouTube Studio)
- Google Cloud OAuth2 client credentials JSON

**n8n:**
- Decide: self-hosted (Railway ~$5/mo) or n8n Cloud (free tier: 5 workflows)
- n8n Cloud free tier is enough for the 2 workflows needed

**OCR:**
- Test the Cloudflare AI path first (zero cost) → if Arabic quality is bad → Railway

---

## Two Things to Do Right Now (before Sprint 2 build)

**1. Keep scanning the liturgikon.** The OCR pipeline is the most valuable piece and it's blocked on raw material. Every evening, photograph 10 pages. Filename them `l0001.jpg` through `l00NN.jpg` sequentially. The pipeline handles the rest.

**2. Trigger the social agents manually** by seeding the `social_posts` table directly to see what Subagent 08b generates:

```bash
# Ask Claude (in a new conversation) to generate an Instagram post
# for this Sunday's feast using the São Jorge agent 08b system prompt.
# Paste the output into /admin/social once that page exists.
```

---

☩ Slava Bohu.
