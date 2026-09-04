-- ☩ São Jorge Curitiba — Sprint 2 Tables
-- Adds blog_posts and social_posts tables (missing from earlier migrations)

-- ─── Blog Posts ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS blog_posts (
  slug         TEXT PRIMARY KEY,
  title_pt     TEXT NOT NULL,
  excerpt_pt   TEXT,
  body_pt      TEXT NOT NULL,   -- Markdown
  tags         TEXT,            -- JSON string[]
  author       TEXT DEFAULT 'Paróquia São Jorge',
  published_at TEXT,
  status       TEXT DEFAULT 'draft'
               CHECK (status IN ('draft','published','archived')),
  created_at   TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_blog_pub ON blog_posts(status, published_at);

-- ─── Social Posts ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS social_posts (
  id            TEXT PRIMARY KEY,
  platform      TEXT NOT NULL,   -- 'instagram' | 'youtube' | 'blog'
  content_type  TEXT,            -- 'image' | 'video' | 'text' (nullable for V1)
  caption       TEXT,            -- Nullable, content stored in JSON below
  media_urls    TEXT,            -- JSON array (nullable)
  content       TEXT NOT NULL,   -- JSON: platform-specific content
  related_date  TEXT,            -- YYYY-MM-DD (nullable)
  scheduled_at  TEXT,
  published_at  TEXT,
  platform_post_id TEXT,         -- ID on the platform (IG/YT) after publishing
  status        TEXT DEFAULT 'draft'
                CHECK (status IN ('draft','approved','scheduled','published','rejected')),
  created_at    TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_social_platform ON social_posts(platform, status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_social_date ON social_posts(related_date);