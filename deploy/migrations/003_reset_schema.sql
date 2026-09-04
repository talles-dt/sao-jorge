-- ☩ São Jorge Curitiba — Reset and Recreate Schema
-- WARNING: This drops all existing tables!

-- Drop existing tables (in reverse dependency order)
DROP TABLE IF EXISTS calendar_hymns;
DROP TABLE IF EXISTS variable_hymns;
DROP TABLE IF EXISTS calendar_saints;
DROP TABLE IF EXISTS readings;
DROP TABLE IF EXISTS announcements;
DROP TABLE IF EXISTS patristic_quotes;
DROP TABLE IF EXISTS saints;
DROP TABLE IF EXISTS calendar_entries;

-- ─── Liturgical Days (Raw scraped data) ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS liturgical_days_raw (
  date TEXT PRIMARY KEY,
  tone_of_week INTEGER NOT NULL DEFAULT 1,
  fast_type TEXT NOT NULL DEFAULT 'none',
  feast_level INTEGER NOT NULL DEFAULT 0,
  feast_name_pt TEXT,
  feast_name_ar TEXT,
  feast_name_en TEXT,
  saint_slug TEXT,
  epistle_ref TEXT,
  gospel_ref TEXT,
  additional_readings TEXT,
  troparion_slug TEXT,
  kontakion_slug TEXT,
  enrichment TEXT,
  source TEXT NOT NULL DEFAULT 'orthocal',
  status TEXT NOT NULL DEFAULT 'pending',
  scraped_at TEXT NOT NULL,
  approved_at TEXT,
  approved_by TEXT
);

-- ─── Liturgical Days (Published) ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS liturgical_days (
  date TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  published_at TEXT NOT NULL
);

-- ─── Review Queue ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS review_queue (
  id TEXT PRIMARY KEY,
  content_type TEXT NOT NULL,
  content_id TEXT NOT NULL,
  agent_source TEXT NOT NULL,
  summary TEXT NOT NULL,
  review_flags TEXT NOT NULL,
  created_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
);

-- ─── Service Catalog ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS service_catalog (
  slug TEXT PRIMARY KEY,
  title_pt TEXT NOT NULL,
  title_ar TEXT,
  occasion TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  available INTEGER NOT NULL DEFAULT 0
);

-- ─── Service Texts ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS service_texts (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL REFERENCES service_catalog(slug),
  sections TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending',
  approved_at TEXT,
  approved_by TEXT,
  created_at TEXT NOT NULL
);

-- ─── Chants ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS chants (
  slug TEXT PRIMARY KEY,
  hymn_type TEXT NOT NULL,
  tone INTEGER,
  title_pt TEXT,
  title_ar TEXT,
  occasion TEXT,
  text_pt TEXT,
  text_ar TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
);

-- ─── Saints ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS saints (
  slug TEXT PRIMARY KEY,
  name_pt TEXT NOT NULL,
  name_ar TEXT,
  name_en TEXT,
  feast_month INTEGER,
  feast_day INTEGER,
  category TEXT DEFAULT 'saint',
  bio_pt TEXT,
  bio_ar TEXT,
  bio_en TEXT,
  icon_url TEXT
);

-- ─── Bulletins ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bulletins (
  id TEXT PRIMARY KEY,
  title_pt TEXT NOT NULL,
  title_ar TEXT,
  body_pt TEXT,
  body_ar TEXT,
  category TEXT DEFAULT 'announcement',
  publish_date TEXT NOT NULL,
  expires_date TEXT,
  status TEXT DEFAULT 'draft'
);

-- ─── Catechesis ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS catechesis (
  slug TEXT PRIMARY KEY,
  title_pt TEXT NOT NULL,
  title_ar TEXT,
  body_pt TEXT,
  body_ar TEXT,
  requires_priest_approval INTEGER DEFAULT 0,
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

-- ─── Agent Errors ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS agent_errors (
  id TEXT PRIMARY KEY,
  agent TEXT NOT NULL,
  error_type TEXT NOT NULL,
  message TEXT NOT NULL,
  context TEXT,
  created_at TEXT NOT NULL
);

-- ─── Conflict Log ─────────────────────────────────────────────────────────────

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
