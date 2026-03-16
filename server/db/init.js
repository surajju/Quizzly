import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'quizfire.db');

let db;

export function getDb() {
  if (db) return db;

  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS quizzes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      questions TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS game_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_code TEXT NOT NULL,
      quiz_title TEXT NOT NULL,
      nickname TEXT NOT NULL,
      score INTEGER DEFAULT 0,
      rank INTEGER,
      total_questions INTEGER DEFAULT 0,
      finished_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_results_game ON game_results(game_code);
    CREATE INDEX IF NOT EXISTS idx_quizzes_created ON quizzes(created_at);
  `);

  logger.info(`Database initialized at ${DB_PATH}`);
  return db;
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}
