import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');

const configuredPath = process.env.SQLITE_DB_PATH?.trim();
const dbPath = configuredPath
  ? path.isAbsolute(configuredPath)
    ? configuredPath
    : path.join(process.cwd(), configuredPath)
  : path.join(dataDir, 'therapy.sqlite');

fs.mkdirSync(dataDir, { recursive: true });

const dbDir = path.dirname(dbPath);
fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL CHECK (role IN ('patient', 'therapist', 'admin')),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS therapist_patient_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    therapist_id INTEGER NOT NULL,
    patient_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(therapist_id, patient_id),
    FOREIGN KEY (therapist_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS mood_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    date TEXT NOT NULL,
    mood_score INTEGER NOT NULL CHECK (mood_score >= 1 AND mood_score <= 10),
    tags TEXT NOT NULL DEFAULT '[]',
    note TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    body TEXT NOT NULL,
    sent_at TEXT NOT NULL DEFAULT (datetime('now')),
    read_at TEXT,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    therapist_id INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (therapist_id) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE INDEX IF NOT EXISTS idx_moods_date ON mood_entries(date);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_moods_patient_date_unique ON mood_entries(patient_id, date);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_moods_anonymous_date_unique
    ON mood_entries(date)
    WHERE patient_id IS NULL;
  CREATE INDEX IF NOT EXISTS idx_messages_pair_time ON messages(sender_id, receiver_id, sent_at);
  CREATE INDEX IF NOT EXISTS idx_messages_receiver_time ON messages(receiver_id, sent_at);
  CREATE INDEX IF NOT EXISTS idx_clients_therapist ON clients(therapist_id);
`);

db.exec(`
  INSERT OR IGNORE INTO clients (user_id, therapist_id)
  SELECT l.patient_id, l.therapist_id
  FROM therapist_patient_links l
  JOIN users p ON p.id = l.patient_id
  WHERE p.role = 'patient'
  ORDER BY l.created_at DESC;
`);

const moodTableSql = db
  .prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'mood_entries'")
  .get();

const needsMoodMigration = String(moodTableSql?.sql || '').toLowerCase().includes('date text not null unique');

if (needsMoodMigration) {
  db.exec('BEGIN');

  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS mood_entries_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER,
        date TEXT NOT NULL,
        mood_score INTEGER NOT NULL CHECK (mood_score >= 1 AND mood_score <= 10),
        tags TEXT NOT NULL DEFAULT '[]',
        note TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE SET NULL
      );

      INSERT INTO mood_entries_new (id, patient_id, date, mood_score, tags, note, created_at, updated_at)
      SELECT id, patient_id, date, mood_score, tags, note, created_at, updated_at
      FROM mood_entries;

      DROP TABLE mood_entries;
      ALTER TABLE mood_entries_new RENAME TO mood_entries;

      CREATE INDEX IF NOT EXISTS idx_moods_date ON mood_entries(date);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_moods_patient_date_unique ON mood_entries(patient_id, date);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_moods_anonymous_date_unique
        ON mood_entries(date)
        WHERE patient_id IS NULL;
    `);

    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

const seedAdmin = db
  .prepare("SELECT id FROM users WHERE email = 'admin@therapy.local'")
  .get();

if (!seedAdmin) {
  db.prepare(
    `INSERT INTO users (role, full_name, email, password_hash)
     VALUES ('admin', 'System Admin', 'admin@therapy.local', 'change-me')`
  ).run();
}

export const databasePath = dbPath;
export default db;