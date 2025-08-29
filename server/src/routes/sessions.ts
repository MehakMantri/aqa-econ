import { Router } from "express";
import { db } from "../db";
import { requireAuth } from "../auth";
import { updateAbility } from "../adaptive";

const router = Router();

function getSessionLength() {
  const s = Number(process.env.SESSION_LENGTH || 10);
  return Math.max(3, Math.min(50, s));
}

router.post("/start", requireAuth, (req: any, res) => {
  const userId = req.user.id;
  const info = db
    .prepare("INSERT INTO sessions (user_id) VALUES (?)")
    .run(userId);
  const session_id = info.lastInsertRowid;
  return res.json({ session_id });
});

router.post("/answer", requireAuth, async (req: any, res) => {
  const userId = req.user.id;
  const { session_id, question_id, selected } = req.body || {};
  if (!session_id || !question_id || !selected) {
    return res
      .status(400)
      .json({ error: "session_id, question_id, selected required" });
  }

  const session = db
    .prepare("SELECT * FROM sessions WHERE id = ? AND user_id = ?")
    .get(session_id, userId);
  if (!session) return res.status(404).json({ error: "Session not found" });

  const q = db.prepare("SELECT * FROM questions WHERE id = ?").get(question_id);
  if (!q) return res.status(404).json({ error: "Question not found" });

  const isCorrect =
    String(selected).toUpperCase() === String(q.correct).toUpperCase() ? 1 : 0;

  // Record answer
  db.prepare(
    `INSERT INTO session_answers (session_id, question_id, selected, correct, topic, difficulty)
              VALUES (?, ?, ?, ?, ?, ?)`
  ).run(
    session_id,
    question_id,
    String(selected).toUpperCase(),
    isCorrect,
    String(q.topics),
    q.difficulty
  );

  // Update session aggregates
  db.prepare(
    `UPDATE sessions SET total = total + 1, correct = correct + ? WHERE id = ?`
  ).run(isCorrect, session_id);

  // Update user ability + topic stats
  const user = db
    .prepare("SELECT id, ability, topic_stats FROM users WHERE id = ?")
    .get(userId);
  const newAbility = updateAbility(user.ability, q.difficulty, !!isCorrect);
  let stats: Record<string, { correct: number; total: number }> = {};
  try {
    stats = JSON.parse(user.topic_stats || "{}");
  } catch {}
  const qTopics = String(q.topics)
    .split(",")
    .map((s: string) => s.trim());
  qTopics.forEach((t: string) => {
    if (!stats[t]) stats[t] = { correct: 0, total: 0 };
    stats[t].total += 1;
    stats[t].correct += isCorrect;
  });

  db.prepare("UPDATE users SET ability = ?, topic_stats = ? WHERE id = ?").run(
    newAbility,
    JSON.stringify(stats),
    userId
  );

  // Check if session should finish
  const length = getSessionLength();
  const after = db
    .prepare("SELECT total FROM sessions WHERE id = ?")
    .get(session_id);
  const done = after.total >= length;

  let nextQuestion: any = null;
  if (!done) {
    const answeredIdsRows = db
      .prepare("SELECT question_id FROM session_answers WHERE session_id = ?")
      .all(session_id);
    const answeredIds = new Set(answeredIdsRows.map((r: any) => r.question_id));

    let topicStats: Record<string, { correct: number; total: number }> = stats;
    const topicsSorted = Object.entries(topicStats)
      .filter(([, v]) => v.total >= 3)
      .map(([k, v]) => [k, v.correct / Math.max(1, v.total)] as const)
      .sort((a, b) => a[1] - b[1])
      .map(([k]) => k);

    // ✅ Now allowed because the handler is async
    const { difficultyToRating } = await import("../adaptive");

    const candidates = db
      .prepare("SELECT * FROM questions")
      .all()
      .filter((qq: any) => !answeredIds.has(qq.id))
      .map((qq: any) => {
        const rating = difficultyToRating(qq.difficulty);
        const closeness = Math.abs(rating - newAbility);
        const qqTopics = String(qq.topics)
          .split(",")
          .map((s: string) => s.trim());
        const weakBoost = qqTopics.some((t: string) =>
          topicsSorted.slice(0, 3).includes(t)
        )
          ? -100
          : 0;
        return { ...qq, rating, closeness: closeness + weakBoost };
      })
      .sort((a: any, b: any) => a.closeness - b.closeness);

    if (candidates.length > 0) {
      const top = candidates.slice(0, Math.min(10, candidates.length));
      const pick = top[Math.floor(Math.random() * top.length)];
      nextQuestion = {
        id: pick.id,
        question: pick.question,
        options: JSON.parse(pick.options_json),
        topics: pick.topics,
        difficulty: pick.difficulty,
      };
    }
  }

  return res.json({
    correct: !!isCorrect,
    done,
    next: nextQuestion,
  });
});

router.post("/finish", requireAuth, (req: any, res) => {
  try {
    const userId = req.user.id;
    const { session_id } = req.body || {};
    if (!session_id) {
      return res.status(400).json({ error: "session_id required" });
    }

    const s = db
      .prepare("SELECT * FROM sessions WHERE id = ? AND user_id = ?")
      .get(session_id, userId);

    if (!s) {
      return res.status(404).json({ error: "Session not found" });
    }

    const score = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;

    db.prepare(
      "UPDATE sessions SET score = ?, finished_at = datetime('now') WHERE id = ?"
    ).run(score, session_id);

    return res.json({ score, finished_at: new Date().toISOString() });
  } catch (err: any) {
    console.error("Error finishing session:", err);
    return res.status(500).json({ error: "Failed to finish session" });
  }
});

export default router;
