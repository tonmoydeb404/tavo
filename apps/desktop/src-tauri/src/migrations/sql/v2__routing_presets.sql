PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- Routing rules: auto-restore. When an app whose name matches app_name
-- produces audio AND target_uid is connected, Tavo routes it automatically.
-- Rules are user-created ("remember this route"), so auto-restore is
-- opt-in by construction.
CREATE TABLE IF NOT EXISTS routing_rules (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  app_name   TEXT NOT NULL,
  target_uid TEXT NOT NULL,
  volume     REAL NOT NULL DEFAULT 1.0,
  enabled    INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Presets: named snapshots of routes (rules_json-free — stored relationally
-- so partial applies are inspectable).
CREATE TABLE IF NOT EXISTS presets (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS preset_rules (
  preset_id  INTEGER NOT NULL REFERENCES presets(id) ON DELETE CASCADE,
  app_name   TEXT NOT NULL,
  target_uid TEXT NOT NULL,
  volume     REAL NOT NULL DEFAULT 1.0,
  position   INTEGER NOT NULL DEFAULT 0
);
