import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { schema } from './schema';

let db: Database.Database | null = null;

export function getDatabase() {
  if (db) return db;

  const dataDir = path.join(process.cwd(), 'data');

  // Ensure data directory exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, 'momentum.db');

  db = new Database(dbPath);

  // Initialize schema
  db.exec(schema);

  return db;
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}
