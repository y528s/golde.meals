-- One row per meal train. The whole train is one JSON document, because it is
-- small (a few KB), always read and written whole, and nothing else queries
-- inside it. `version` is what stops two people taking Tuesday.
CREATE TABLE IF NOT EXISTS trains (
  id          TEXT PRIMARY KEY,
  version     INTEGER NOT NULL DEFAULT 1,
  data        TEXT    NOT NULL,
  created_at  TEXT    NOT NULL,
  updated_at  TEXT    NOT NULL,
  -- Retention is measured from when the cooking stops, not from creation: a
  -- shiva is seven days and a recovery can be months.
  expires_at  TEXT
);

CREATE INDEX IF NOT EXISTS idx_trains_expires ON trains(expires_at);

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
