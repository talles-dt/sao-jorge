CREATE TABLE IF NOT EXISTS catechesis_signups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  unit_slug TEXT NOT NULL REFERENCES catechesis_units(slug),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  birth_date TEXT,
  previous_religion TEXT,
  motivation TEXT,
  agreed_to_terms INTEGER NOT NULL CHECK (agreed_to_terms = 1),
  consent_version TEXT NOT NULL DEFAULT '2026-10-13',
  consented_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  privacy_policy_version TEXT NOT NULL DEFAULT '2026-10-13',
  retention_until TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_catechesis_signups_retention ON catechesis_signups(retention_until);
CREATE INDEX IF NOT EXISTS idx_catechesis_signups_email ON catechesis_signups(email);
