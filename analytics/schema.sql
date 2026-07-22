CREATE TABLE IF NOT EXISTS analytics_events (
  event_id TEXT PRIMARY KEY,
  received_at TEXT NOT NULL DEFAULT (datetime('now')),
  client_occurred_at TEXT,
  event_name TEXT NOT NULL,
  session_id TEXT NOT NULL,
  page_path TEXT NOT NULL,
  object_type TEXT,
  object_id TEXT,
  action TEXT,
  destination TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT
);

CREATE INDEX IF NOT EXISTS analytics_events_received_idx ON analytics_events(received_at);
CREATE INDEX IF NOT EXISTS analytics_events_name_idx ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS analytics_events_object_idx ON analytics_events(object_type, object_id, action);
