-- One row per meal train. The whole train is one JSON document, because it is
-- small (a few KB), always read and written whole, and nothing else queries
-- inside it. `version` is what stops two people taking Tuesday.
CREATE TABLE IF NOT EXISTS trains (
  id          TEXT PRIMARY KEY,     -- cohen-08-26-k7f2
  -- The planner's namespace: last four of their phone. Stored rather than
  -- derived, so a change of number never breaks a link already shared.
  planner_key TEXT NOT NULL DEFAULT '',
  version     INTEGER NOT NULL DEFAULT 1,
  data        TEXT    NOT NULL,
  created_at  TEXT    NOT NULL,
  updated_at  TEXT    NOT NULL,
  -- Retention is measured from when the cooking stops, not from creation: a
  -- shiva is seven days and a recovery can be months.
  expires_at  TEXT
);

CREATE INDEX IF NOT EXISTS idx_trains_expires ON trains(expires_at);
CREATE INDEX IF NOT EXISTS idx_trains_planner ON trains(planner_key);

-- A planner's desk. No password: they receive a link by text, which is also how
-- somebody gets from their phone onto a laptop. The token is stored rather than
-- signed so it can be revoked.
CREATE TABLE IF NOT EXISTS planners (
  planner_key TEXT PRIMARY KEY,
  phone       TEXT NOT NULL,
  token       TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  last_seen   TEXT
);

-- Reminders are written when somebody claims a night and marked sent by the
-- cron. A row per send, so a retry can never send twice.
CREATE TABLE IF NOT EXISTS reminders (
  id          TEXT PRIMARY KEY,
  train_id    TEXT NOT NULL,
  slot_id     TEXT NOT NULL,
  send_after  TEXT NOT NULL,     -- ISO; the cron picks up anything due
  channel     TEXT NOT NULL,     -- sms | email
  handle      TEXT NOT NULL,
  body        TEXT NOT NULL,
  sent_at     TEXT,
  error       TEXT
);

CREATE INDEX IF NOT EXISTS idx_reminders_due ON reminders(sent_at, send_after);
