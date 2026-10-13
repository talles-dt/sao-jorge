CREATE TABLE IF NOT EXISTS admin_audit_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_subject TEXT NOT NULL,
  actor_email TEXT,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  metadata TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_admin_audit_events_created ON admin_audit_events(created_at);
