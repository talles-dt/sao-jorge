CREATE TABLE IF NOT EXISTS signup_rate_limits (
  rate_key TEXT PRIMARY KEY,
  window_start TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 0
);
