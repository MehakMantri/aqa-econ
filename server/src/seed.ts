import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { db } from "./db";

type Row = {
  question: string;
  A: string;
  B: string;
  C: string;
  D: string;
  correct: "A" | "B" | "C" | "D";
  topics: string;
  difficulty: string;
  source: string;
};

async function seed() {
  const rows: Row[] = [];

  const csvPath = path.join(__dirname, "seed", "questions.csv"); // 👈 point to seed folder

  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on("data", (row: Row) => rows.push(row))
      .on("end", () => resolve())
      .on("error", reject);
  });

  for (const r of rows) {
    await db.run(
      `INSERT INTO questions (question, options, answer, topics, difficulty, source) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        r.question,
        JSON.stringify({ A: r.A, B: r.B, C: r.C, D: r.D }),
        r.correct,
        r.topics,
        parseInt(r.difficulty),
        r.source,
      ]
    );
  }

  console.log("✅ Seeding complete");
}

seed();
