import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

let db: Database.Database | null = null;

export function getSqlite() {
  if (db) return db;

  const file = process.env.SQLITE_PATH || "./data/app.db";
  const dir = path.dirname(file);
  if (dir && dir !== ".") {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = new Database(file);
  db.pragma("journal_mode = WAL");
  return db;
}
