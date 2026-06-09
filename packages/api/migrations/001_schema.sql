-- ☩ São Jorge V2 — D1 Schema
-- Migration 001: Core tables

-- Liturgical days (raw scraped data)
CREATE TABLE IF NOT EXISTS liturgical_days (
  date          TEXT PRIMARY KEY,
  tone_of_week  INTEGER CHECK (tone_of_week BETWEEN 1 AND 8),
  fast_type     TEXT CHECK (fast_type IN ('none','strict','fish','wine-oil','xerophagy')),
  feast_level   INTEGER DEFAULT 0 CHECK (feast_level BETWEEN 0 AND 6),
  feast_name_pt TEXT,
  feast_name_ar TEXT,
  feast_name_en TEXT,
  saint_slug    TEXT,
  epistle_ref   TEXT,
  gospel_ref    TEXT,
  epistle_text_pt TEXT,
  gospel_text_pt TEXT,
  troparion_slug TEXT,
  kontakion_slug TEXT,
  enrichment    TEXT, -- JSON: { saintBioPt, patristicQuotePt, patristicSource, reviewFlags[] }
  source        TEXT DEFAULT 'orthocal' CHECK (source IN ('antiochian','orthocal','dcs','manual-override')),
  status        TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','published')),
  scraped_at    TEXT NOT NULL,
  approved_at TEXT,
  approved_by   TEXT
);

CREATE INDEX IF NOT EXISTS idx_liturgical_days_status ON liturgical_days(status);
CREATE INDEX IF NOT EXISTS idx_liturgical_days_date ON liturgical_days(date);

-- Service catalog (master list)
CREATE TABLE IF NOT EXISTS service_catalog (
  slug          TEXT PRIMARY KEY,
  title_pt      TEXT NOT NULL,
  title_ar      TEXT,
  category      TEXT NOT NULL CHECK (category IN ('liturgia','completas','horas','ortros','vesperas','akathistos','semana-santa','oracoes','sacramentos','paraklesis','preparacao')),
  subcategory   TEXT,
  sort_order    INTEGER DEFAULT 0
);

-- Service texts (per-version historical)
CREATE TABLE IF NOT EXISTS service_texts (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  slug          TEXT NOT NULL,
  title_pt      TEXT NOT NULL,
  title_ar      TEXT,
  title_ar_transliterated TEXT,
  category      TEXT NOT NULL,
  subcategory   TEXT,
  sections      TEXT NOT NULL, -- JSON array of VerseBlock
  status        TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','published')),
  version       INTEGER NOT NULL DEFAULT 1,
  source_booklet_pages TEXT,
  updated_at    TEXT NOT NULL,
  approved_at   TEXT,
  approved_by   TEXT
);

CREATE INDEX IF NOT EXISTS idx_service_texts_slug ON service_texts(slug);

-- Blog posts
CREATE TABLE IF NOT EXISTS blog_posts (
  slug          TEXT PRIMARY KEY,
  title         TEXT NOT NULL,
  excerpt       TEXT NOT NULL,
  body          TEXT NOT NULL,
  author        TEXT NOT NULL,
  category      TEXT NOT NULL CHECK (category IN ('catechesis','liturgical','parish-news','patristic')),
  tags          TEXT, -- JSON array
  featured_image TEXT,
  status        TEXT DEFAULT 'draft' CHECK (status IN ('draft','published')),
  published_at  TEXT,
  created_at    TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);

-- Catechesis units
CREATE TABLE IF NOT EXISTS catechesis_units (
  slug          TEXT PRIMARY KEY,
  title         TEXT NOT NULL,
  description   TEXT NOT NULL,
  order_index   INTEGER NOT NULL DEFAULT 0
);

-- Catechesis lessons
CREATE TABLE IF NOT EXISTS catechesis_lessons (
  slug          TEXT PRIMARY KEY,
  unit_slug     TEXT NOT NULL REFERENCES catechesis_units(slug),
  title         TEXT NOT NULL,
  order_index   INTEGER NOT NULL DEFAULT 0,
  body          TEXT NOT NULL,
  status        TEXT DEFAULT 'draft' CHECK (status IN ('draft','published'))
);

-- Bulletins (parish announcements)
CREATE TABLE IF NOT EXISTS bulletins (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  title         TEXT NOT NULL,
  body          TEXT NOT NULL,
  category      TEXT NOT NULL CHECK (category IN ('announcement','event','pastoral')),
  publish_date  TEXT NOT NULL,
  expires_date  TEXT,
  status        TEXT DEFAULT 'pending' CHECK (status IN ('pending','published')),
  created_at    TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bulletins_status ON bulletins(status);
CREATE INDEX IF NOT EXISTS idx_bulletins_date ON bulletins(publish_date);

-- Podcast episodes
CREATE TABLE IF NOT EXISTS podcast_episodes (
  guid          TEXT PRIMARY KEY,
  title         TEXT NOT NULL,
  description   TEXT,
  published_at  TEXT NOT NULL,
  duration_sec  INTEGER DEFAULT 0,
  spotify_url   TEXT,
  buzzsprout_url TEXT,
  synced_at     TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Chants (resurrectional, by tone)
CREATE TABLE IF NOT EXISTS chants (
  slug          TEXT PRIMARY KEY,
  title_pt      TEXT NOT NULL,
  title_ar      TEXT,
  tone          INTEGER CHECK (tone BETWEEN 1 AND 8),
  occasion      TEXT,
  text_pt       TEXT,
  text_ar       TEXT,
  text_ar_transliterated TEXT,
  status        TEXT DEFAULT 'published'
);

-- Conflict log (for scraper reconciliation)
CREATE TABLE IF NOT EXISTS conflict_log (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  date          TEXT NOT NULL,
  field         TEXT NOT NULL,
  source_a      TEXT NOT NULL,
  value_a       TEXT,
  source_b      TEXT NOT NULL,
  value_b       TEXT,
  resolution    TEXT,
  resolved_by   TEXT,
  created_at    TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
