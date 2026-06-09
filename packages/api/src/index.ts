// ☩ São Jorge V2 — Main Cloudflare Worker
// Entry point: HTTP API + Cron trigger

// ─── Types (inline to avoid bundler issues with shared package) ──

export interface Env {
  DB: D1Database
  DAY_CACHE: KVNamespace
  MEDIA: R2Bucket
  ADMIN_TOKEN: string
  ENVIRONMENT: string
}

export interface LiturgicalDayRow {
  date: string
  tone_of_week: number
  fast_type: string
  feast_level: number
  feast_name_pt: string | null
  feast_name_ar: string | null
  feast_name_en: string | null
  saint_slug: string | null
  epistle_ref: string | null
  gospel_ref: string | null
  epistle_text_pt: string | null
  gospel_text_pt: string | null
  troparion_slug: string | null
  kontakion_slug: string | null
  enrichment: string | null
  source: string
  status: string
  scraped_at: string
  approved_at: string | null
  approved_by: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  }
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders(),
  })
}

function todayBrasilia(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
}

function checkAdminAuth(request: Request, env: Env): { ok: boolean } {
  const auth = request.headers.get('Authorization')
  if (!auth || !auth.startsWith('Bearer ')) return { ok: false }
  const token = auth.slice(7)
  return { ok: token === env.ADMIN_TOKEN }
}

// ─── Scraping: orthocal.info ──────────────────────────────────────────────────

interface OrthocalResponse {
  titles?: string[]
  feasts?: Array<{ title: string; level: number }>
  tone?: number
  fast_exception?: number
  readings?: Array<{
    source: string
    book: string
    display: string
  }>
}

async function fetchOrthocal(date: string): Promise<Partial<LiturgicalDayRow>> {
  const [year, month, day] = date.split('-')
  const url = `https://orthocal.info/api/gregorian/${year}/${month}/${day}/`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`orthocal ${date}: ${res.status}`)
  const data = (await res.json()) as OrthocalResponse

  const fastTypeMap: Record<number, string> = {
    0: 'none', 1: 'wine-oil', 2: 'fish', 3: 'wine-oil',
    4: 'strict', 7: 'xerophagy', 11: 'none', 49: 'none',
  }

  const feasts = data.feasts || []
  const mainFeast = feasts[0]

  // Parse readings for epistle/gospel refs
  const readings = data.readings || []
  const epistleReading = readings.find(r => r.source === 'epistle')
  const gospelReading = readings.find(r => r.source === 'gospel')

  return {
    date,
    tone_of_week: data.tone ?? 1,
    fast_type: fastTypeMap[data.fast_exception ?? 0] ?? 'none',
    feast_level: mainFeast?.level ?? 0,
    feast_name_pt: mainFeast?.title ?? null,
    feast_name_en: data.titles?.[0] ?? null,
    saint_slug: null,
    epistle_ref: epistleReading?.display ?? null,
    gospel_ref: gospelReading?.display ?? null,
    epistle_text_pt: null,
    gospel_text_pt: null,
    troparion_slug: null,
    kontakion_slug: null,
    enrichment: null,
    source: 'orthocal',
    status: 'pending',
    scraped_at: new Date().toISOString(),
    approved_at: null,
    approved_by: null,
  }
}

async function runScraper(env: Env): Promise<void> {
  const today = todayBrasilia()
  const dates: string[] = []
  for (let i = 0; i < 8; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    dates.push(d.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }))
  }

  const results = await Promise.allSettled(
    dates.map(d => fetchOrthocal(d))
  )

  for (let i = 0; i < dates.length; i++) {
    const result = results[i]
    if (result.status === 'rejected') {
      console.error(`[scraper] Failed ${dates[i]}:`, result.reason)
      continue
    }
    const row = result.value
    await env.DB.prepare(
      `INSERT OR REPLACE INTO liturgical_days
       (date, tone_of_week, fast_type, feast_level, feast_name_pt, feast_name_en,
        epistle_ref, gospel_ref, source, status, scraped_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      row.date, row.tone_of_week, row.fast_type, row.feast_level,
      row.feast_name_pt, row.feast_name_en, row.epistle_ref, row.gospel_ref,
      row.source, row.status, row.scraped_at
    ).run()
    console.log(`[scraper] ✓ ${row.date} — ${row.feast_name_pt ?? 'Féria'}`)
  }
}

// ─── Public API Handlers ──────────────────────────────────────────────────────

async function handleDayToday(env: Env): Promise<Response> {
  const today = todayBrasilia()
  const cached = await env.DAY_CACHE.get(`day:${today}`)
  if (cached) return jsonResponse(JSON.parse(cached))

  const row = await env.DB.prepare(
    `SELECT * FROM liturgical_days WHERE date = ?`
  ).bind(today).first<LiturgicalDayRow>()

  if (!row) return jsonResponse({ error: 'No data for today', date: today }, 404)

  const data = { ...row, enrichment: row.enrichment ? JSON.parse(row.enrichment) : null }
  await env.DAY_CACHE.put(`day:${today}`, JSON.stringify(data), { expirationTtl: 86400 })
  return jsonResponse(data)
}

async function handleDayByDate(date: string, env: Env): Promise<Response> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return jsonResponse({ error: 'Invalid date format' }, 400)
  }
  const cached = await env.DAY_CACHE.get(`day:${date}`)
  if (cached) return jsonResponse(JSON.parse(cached))

  const row = await env.DB.prepare(
    `SELECT * FROM liturgical_days WHERE date = ?`
  ).bind(date).first<LiturgicalDayRow>()

  if (!row) return jsonResponse({ error: 'Not found', date }, 404)

  const data = { ...row, enrichment: row.enrichment ? JSON.parse(row.enrichment) : null }
  await env.DAY_CACHE.put(`day:${date}`, JSON.stringify(data), { expirationTtl: 86400 })
  return jsonResponse(data)
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default {
  // HTTP API
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const path = url.pathname

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() })
    }

    // Public routes
    if (path === '/api/health') {
      return jsonResponse({ ok: true, env: env.ENVIRONMENT, date: todayBrasilia() })
    }

    if (path === '/api/day/today' && request.method === 'GET') {
      return handleDayToday(env)
    }

    if (path.startsWith('/api/day/') && request.method === 'GET') {
      const date = path.split('/api/day/')[1] ?? ''
      return handleDayByDate(date, env)
    }

    if (path === '/api/services' && request.method === 'GET') {
      const rows = await env.DB.prepare(
        `SELECT slug, title_pt, title_ar, category, subcategory, sort_order FROM service_catalog ORDER BY sort_order ASC`
      ).all()
      return jsonResponse(rows.results)
    }

    if (path.startsWith('/api/services/') && request.method === 'GET') {
    const slug = path.split('/api/services/')[1]?.replace('/', '') ?? ''
    const row = await env.DB.prepare(
    `SELECT st.*, sc.title_pt AS catalog_title_pt, sc.title_ar AS catalog_title_ar FROM service_texts st LEFT JOIN service_catalog sc ON st.slug = sc.slug WHERE st.slug = ? AND st.status = 'published' ORDER BY st.version DESC LIMIT 1`
    ).bind(slug).first()
    if (!row) return jsonResponse({ error: 'Service not found' }, 404)
    const sections = row.sections ? JSON.parse(row.sections as string) : []
    return jsonResponse({ ...row, sections })
    }

    if (path === '/api/blog' && request.method === 'GET') {
      const limit = parseInt(url.searchParams.get('limit') ?? '10')
      const rows = await env.DB.prepare(
        `SELECT slug, title, excerpt, author, category, tags, published_at, created_at FROM blog_posts WHERE status = 'published' ORDER BY published_at DESC LIMIT ?`
      ).bind(limit).all()
      return jsonResponse(rows.results)
    }

    if (path.startsWith('/api/blog/') && request.method === 'GET') {
      const slug = path.split('/api/blog/')[1]?.replace('/', '') ?? ''
      const row = await env.DB.prepare(
        `SELECT * FROM blog_posts WHERE slug = ? AND status = 'published' LIMIT 1`
      ).bind(slug).first()
      if (!row) return jsonResponse({ error: 'Post not found' }, 404)
      return jsonResponse(row)
    }

    if (path === '/api/bulletin' && request.method === 'GET') {
      const limit = parseInt(url.searchParams.get('limit') ?? '20')
      const today = todayBrasilia()
      const rows = await env.DB.prepare(
        `SELECT id, title, body, category, publish_date FROM bulletins WHERE status = 'published' AND publish_date <= ? AND (expires_date IS NULL OR expires_date >= ?) ORDER BY publish_date DESC LIMIT ?`
      ).bind(today, today, limit).all()
      return jsonResponse(rows.results)
    }

    if (path === '/api/catechesis' && request.method === 'GET') {
      const rows = await env.DB.prepare(
        `SELECT slug, title, description, order_index FROM catechesis_units ORDER BY order_index ASC`
      ).all()
      return jsonResponse(rows.results)
    }

    if (path.startsWith('/api/catechesis/') && request.method === 'GET') {
      const slug = path.split('/api/catechesis/')[1]?.replace('/', '') ?? ''
      const unit = await env.DB.prepare(
        `SELECT * FROM catechesis_units WHERE slug = ?`
      ).bind(slug).first()
      if (!unit) return jsonResponse({ error: 'Unit not found' }, 404)
      const lessons = await env.DB.prepare(
        `SELECT slug, title, order_index, status FROM catechesis_lessons WHERE unit_slug = ? AND status = 'published' ORDER BY order_index`
      ).bind(slug).all()
      return jsonResponse({ ...unit, lessons: lessons.results })
    }

    if (path === '/api/podcast' && request.method === 'GET') {
      const rows = await env.DB.prepare(
        `SELECT guid, title, description, published_at, duration_sec, spotify_url, buzzsprout_url FROM podcast_episodes ORDER BY published_at DESC LIMIT 10`
      ).all()
      return jsonResponse(rows.results)
    }

    // Admin routes
    if (path.startsWith('/api/admin/')) {
      const auth = checkAdminAuth(request, env)
      if (!auth.ok) {
        return jsonResponse({ error: 'Unauthorized' }, 401)
      }

      if (path === '/api/admin/liturgical' && request.method === 'POST') {
        const body = await request.json() as any
        const { date, ...data } = body
        await env.DB.prepare(
          `INSERT OR REPLACE INTO liturgical_days (date, tone_of_week, fast_type, feast_level, feast_name_pt, feast_name_ar, epistle_ref, gospel_ref, source, status, scraped_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          date, data.tone_of_week ?? 1, data.fast_type ?? 'none',
          data.feast_level ?? 0, data.feast_name_pt, data.feast_name_ar,
          data.epistle_ref, data.gospel_ref, 'manual-override',
          data.status ?? 'approved', new Date().toISOString()
        ).run()
        return jsonResponse({ ok: true })
      }

      if (path === '/api/admin/blog' && request.method === 'POST') {
        const body = await request.json() as any
        const now = new Date().toISOString()
        await env.DB.prepare(
          `INSERT OR REPLACE INTO blog_posts (slug, title, excerpt, body, author, category, tags, status, published_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          body.slug, body.title, body.excerpt, body.body, body.author,
          body.category, JSON.stringify(body.tags ?? []), body.status ?? 'draft',
          body.status === 'published' ? now : body.published_at, now
        ).run()
        return jsonResponse({ ok: true })
      }

      if (path === '/api/admin/bulletin' && request.method === 'POST') {
      const body = await request.json() as any
      await env.DB.prepare(
      `INSERT OR REPLACE INTO bulletins (title, body, category, publish_date, expires_date, status) VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(
      body.title, body.body, body.category, body.publish_date,
      body.expires_date ?? null, body.status ?? 'pending'
      ).run()
      return jsonResponse({ ok: true })
      }

      if (path === '/api/admin/service-texts' && request.method === 'GET') {
 const slug = url.searchParams.get('slug') ?? ''
 if (slug) {
 const rows = await env.DB.prepare(
 `SELECT id, slug, title_pt, title_ar, title_ar_transliterated, category, subcategory, status, version, source_booklet_pages, updated_at, approved_at FROM service_texts WHERE slug = ? ORDER BY version DESC`
 ).bind(slug).all()
 return jsonResponse(rows.results)
 }
 const rows = await env.DB.prepare(
 `SELECT st.id, st.slug, st.title_pt, st.status, st.version, st.updated_at, sc.title_pt AS catalog_title_pt FROM service_texts st LEFT JOIN service_catalog sc ON st.slug = sc.slug ORDER BY st.slug, st.version DESC`
 ).all()
 return jsonResponse(rows.results)
 }

 if (path === '/api/admin/service-texts' && request.method === 'POST') {
      const body = await request.json() as any
      const now = new Date().toISOString()
      const sections = typeof body.sections === 'string' ? body.sections : JSON.stringify(body.sections ?? [])
      const currentVersion = await env.DB.prepare(
      `SELECT MAX(version) as max_v FROM service_texts WHERE slug = ?`
      ).bind(body.slug).first<{ max_v: number | null }>()
      const version = (currentVersion?.max_v ?? 0) + 1
      await env.DB.prepare(
      `INSERT INTO service_texts (slug, title_pt, title_ar, title_ar_transliterated, category, subcategory, sections, status, version, source_booklet_pages, updated_at, approved_at, approved_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
      body.slug, body.title_pt, body.title_ar ?? null, body.title_ar_transliterated ?? null,
      body.category, body.subcategory ?? null, sections,
      body.status ?? 'pending', version, body.source_booklet_pages ?? null,
      now, body.status === 'published' ? now : null, body.status === 'published' ? 'admin' : null
      ).run()
      return jsonResponse({ ok: true, version })
      }

      if (path === '/api/admin/service-texts' && request.method === 'PUT') {
      const body = await request.json() as any
      const now = new Date().toISOString()
      const sections = typeof body.sections === 'string' ? body.sections : JSON.stringify(body.sections ?? [])
      await env.DB.prepare(
      `UPDATE service_texts SET title_pt = ?, title_ar = ?, title_ar_transliterated = ?, category = ?, subcategory = ?, sections = ?, status = ?, source_booklet_pages = ?, updated_at = ?, approved_at = ?, approved_by = ? WHERE id = ?`
      ).bind(
      body.title_pt, body.title_ar ?? null, body.title_ar_transliterated ?? null,
      body.category, body.subcategory ?? null, sections,
      body.status ?? 'pending', body.source_booklet_pages ?? null,
      now, body.status === 'published' ? now : null, body.status === 'published' ? 'admin' : null,
      body.id
      ).run()
      return jsonResponse({ ok: true })
      }

      if (path === '/api/admin/scrape-now' && request.method === 'POST') {
        await runScraper(env)
        return jsonResponse({ ok: true, triggered: 'scraper' })
      }

      return jsonResponse({ error: 'Not found' }, 404)
    }

    return jsonResponse({ error: 'Not found' }, 404)
  },

  // Cron trigger — daily scraper
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    console.log(`[cron] ☩ São Jorge scraper — ${todayBrasilia()}`)
    try {
      await runScraper(env)
      await env.DAY_CACHE.delete('day:' + todayBrasilia())
    } catch (e: any) {
      console.error('[cron] Scraper error:', e.message)
    }
  },
}
