import { db } from "./db";
import fs from "fs";
import path from "path";

export function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      ability REAL NOT NULL DEFAULT 1000,
      topic_stats TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      options_json TEXT NOT NULL, -- JSON: {A,B,C,D}
      correct TEXT NOT NULL,      -- 'A' | 'B' | 'C' | 'D'
      topics TEXT NOT NULL,       -- comma-separated topics
      difficulty INTEGER NOT NULL -- 1..5
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      started_at TEXT NOT NULL DEFAULT (datetime('now')),
      finished_at TEXT,
      total INTEGER DEFAULT 0,
      correct INTEGER DEFAULT 0,
      score REAL,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS session_answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      question_id INTEGER NOT NULL,
      selected TEXT NOT NULL,
      correct INTEGER NOT NULL, -- 0/1
      topic TEXT NOT NULL,
      difficulty INTEGER NOT NULL,
      answered_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(session_id) REFERENCES sessions(id),
      FOREIGN KEY(question_id) REFERENCES questions(id)
    );
  `);
}

export function seedQuestionsIfEmpty() {
  const row = db.prepare("SELECT COUNT(*) as count FROM questions").get();
  if (row.count > 0) return;

  const seedPath = path.join(process.cwd(), "seed", "questions.csv");
  if (!fs.existsSync(seedPath)) {
    console.warn("Seed CSV not found: ", seedPath);
    return;
  }

  const insert = db.prepare(`
    INSERT INTO questions (question, options_json, correct, topics, difficulty)
    VALUES (@question, @options_json, @correct, @topics, @difficulty)
  `);

  const csv = fs.readFileSync(seedPath, "utf-8").trim().split("\n");
  // Skip header
  for (let i = 1; i < csv.length; i++) {
    const line = csv[i];
    // Simple CSV split (no quoted commas in our data)
    const parts = line.split(",");
    if (parts.length < 9) continue;
    const [question, A, B, C, D, correct, topics, difficulty, _source] = parts;
    const options = { A, B, C, D };
    insert.run({
      question,
      options_json: JSON.stringify(options),
      correct,
      topics,
      difficulty: Number(difficulty) || 1,
    });
  }
  console.log("Seeded questions from CSV.");
}
