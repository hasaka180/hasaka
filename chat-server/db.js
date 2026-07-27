'use strict'
const Database = require('better-sqlite3')
const path = require('path')

const db = new Database(process.env.DB_PATH || path.join(__dirname, 'data.db'))
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS conversations (
    id              TEXT PRIMARY KEY,
    visitor_id      TEXT NOT NULL,
    visitor_name    TEXT,
    visitor_email   TEXT,
    page_url        TEXT,
    user_agent      TEXT,
    locale          TEXT,
    status          TEXT NOT NULL DEFAULT 'open',
    unread_count    INTEGER NOT NULL DEFAULT 0,
    last_message    TEXT,
    last_message_at INTEGER,
    created_at      INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS messages (
    id              TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL REFERENCES conversations(id),
    author          TEXT NOT NULL,
    author_name     TEXT,
    body            TEXT NOT NULL,
    created_at      INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS devices (
    token      TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL
  );
`)

module.exports = db
