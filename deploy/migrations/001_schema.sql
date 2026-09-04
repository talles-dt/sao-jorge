-- ☩ São Jorge Curitiba — Database Schema v2
-- Tables for agentic liturgical pipeline

-- ─── Liturgical Days (Raw scraped data) ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS liturgical_days_raw (
  date TEXT PRIMARY KEY,
  tone_of_week INTEGER NOT NULL DEFAULT 1,
  fast_type TEXT NOT NULL DEFAULT 'none', -- 'none' | 'strict' | 'fish' | 'wine-oil' | 'xerophagy'
  feast_level INTEGER NOT NULL DEFAULT 0, -- 0=feria, 1=simple, 2=polyeleos, 3=feast, 4=great-feast, 5=nativity/theophany, 6=pascha
  feast_name_pt TEXT,
  feast_name_ar TEXT,
  feast_name_en TEXT,
  saint_slug TEXT,
  epistle_ref TEXT, -- JSON: {bookCode, chapter, verseStart, verseEnd, textPt, textAr, textEn}
  gospel_ref TEXT,  -- JSON
  additional_readings TEXT, -- JSON array
  troparion_slug TEXT,
  kontakion_slug TEXT,
  enrichment TEXT, -- JSON: {saintBioPt, saintBioAr, patristicQuotePt, patristicQuoteEn, patristicQuoteAr, patristicSource, reviewFlags}
  source TEXT NOT NULL DEFAULT 'orthocal', -- 'orthocal' | 'antiochian' | 'manual-override'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'approved' | 'published' | 'rejected'
  scraped_at TEXT NOT NULL,
  approved_at TEXT,
  approved_by TEXT
);

-- ─── Liturgical Days (Published) ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS liturgical_days (
  date TEXT PRIMARY KEY,
  data TEXT NOT NULL, -- Full JSON of the LiturgicalDay
  published_at TEXT NOT NULL
);

-- ─── Review Queue (Agent output awaiting human approval) ─────────────────────

CREATE TABLE IF NOT EXISTS review_queue (
  id TEXT PRIMARY KEY,
  content_type TEXT NOT NULL, -- 'liturgical_day' | 'service_text' | 'chant' | 'catechesis' | 'bulletin' | 'social_post'
  content_id TEXT NOT NULL,
  agent_source TEXT NOT NULL,
  summary TEXT NOT NULL,
  review_flags TEXT NOT NULL, -- JSON array of strings
  created_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' -- 'pending' | 'approved' | 'rejected'
);

-- ─── Service Catalog ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS service_catalog (
  slug TEXT PRIMARY KEY,
  title_pt TEXT NOT NULL,
  title_ar TEXT,
  occasion TEXT, -- e.g., 'daily', 'sunday', 'feast'
  sort_order INTEGER NOT NULL DEFAULT 0,
  available INTEGER NOT NULL DEFAULT 0 -- 0 or 1
);

-- ─── Service Texts (Versions for each service) ───────────────────────────────

CREATE TABLE IF NOT EXISTS service_texts (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL REFERENCES service_catalog(slug),
  sections TEXT NOT NULL, -- JSON array of VerseBlock
  version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'published' | 'archived'
  approved_at TEXT,
  approved_by TEXT,
  created_at TEXT NOT NULL
);

-- ─── Chants (Troparia, Kontakia, etc.) ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS chants (
  slug TEXT PRIMARY KEY,
  hymn_type TEXT NOT NULL, -- 'troparion' | 'kontakion' | 'stichera' | 'sessional_hymn'
  tone INTEGER, -- 1-8
  title_pt TEXT,
  title_ar TEXT,
  occasion TEXT,
  text_pt TEXT,
  text_ar TEXT,
  status TEXT NOT NULL DEFAULT 'pending' -- 'pending' | 'published'
);

-- ─── Saints ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS saints (
  slug TEXT PRIMARY KEY,
  name_pt TEXT NOT NULL,
  name_ar TEXT,
  name_en TEXT,
  feast_month INTEGER,
  feast_day INTEGER,
  category TEXT DEFAULT 'saint', -- 'saint' | 'apostle' | 'martyr' | 'theotokos' | 'great_feast'
  bio_pt TEXT,
  bio_ar TEXT,
  bio_en TEXT,
  icon_url TEXT
);

-- ─── Bulletins/Announcements ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bulletins (
  id TEXT PRIMARY KEY,
  title_pt TEXT NOT NULL,
  title_ar TEXT,
  body_pt TEXT,
  body_ar TEXT,
  category TEXT DEFAULT 'announcement', -- 'announcement' | 'event' | 'catechesis'
  publish_date TEXT NOT NULL,
  expires_date TEXT,
  status TEXT DEFAULT 'draft' -- 'draft' | 'published' | 'archived'
);

-- ─── Catechesis ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS catechesis (
  slug TEXT PRIMARY KEY,
  title_pt TEXT NOT NULL,
  title_ar TEXT,
  body_pt TEXT,
  body_ar TEXT,
  requires_priest_approval INTEGER DEFAULT 0, -- 0 or 1
  status TEXT DEFAULT 'draft'
);

-- ─── Podcast Episodes ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS podcast_episodes (
  guid TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  published_at TEXT NOT NULL,
  duration_sec INTEGER,
  spotify_url TEXT,
  buzzsprout_url TEXT,
  synced_at TEXT NOT NULL
);

-- ─── Agent Errors (Logging) ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS agent_errors (
  id TEXT PRIMARY KEY,
  agent TEXT NOT NULL,
  error_type TEXT NOT NULL,
  message TEXT NOT NULL,
  context TEXT, -- JSON
  created_at TEXT NOT NULL
);

-- ─── Conflict Log (Source discrepancies) ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS conflict_log (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  field TEXT NOT NULL,
  source_a TEXT,
  value_a TEXT,
  source_b TEXT,
  value_b TEXT,
  created_at TEXT NOT NULL
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_liturgical_raw_status ON liturgical_days_raw(status);
CREATE INDEX IF NOT EXISTS idx_review_queue_status ON review_queue(status);
CREATE INDEX IF NOT EXISTS idx_service_texts_slug ON service_texts(slug);
CREATE INDEX IF NOT EXISTS idx_chants_tone ON chants(tone);
CREATE INDEX IF NOT EXISTS idx_agent_errors_created ON agent_errors(created_at);
CREATE INDEX IF NOT EXISTS idx_conflict_log_date ON conflict_log(date);
