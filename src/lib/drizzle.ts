import Database from "better-sqlite3";

export const sqlite = new Database(process.env.SQLITE_PATH || "./data/app.db");
sqlite.pragma("journal_mode = WAL");
