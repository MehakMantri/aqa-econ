import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

export const db = new Database(path.join(dataDir, 'app.db'));

// Pragmas for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
