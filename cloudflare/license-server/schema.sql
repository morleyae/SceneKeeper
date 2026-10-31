CREATE TABLE IF NOT EXISTS licenses (
  key_hash TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  device_id TEXT,
  created_at TEXT NOT NULL,
  activated_at TEXT
);
