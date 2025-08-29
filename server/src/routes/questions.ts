import { Router } from "express";
import { db } from "../db";
import { requireAuth } from "../auth";
import { difficultyToRating } from "../adaptive";

const router = Router();

router.get("/next", requireAuth, (req: any, res) => {
  const userId = req.user.id;
  const { session_id } = req.query as any;
  if (!session_id)
    return res.status(400).json({ error: "session_id required" });

  const session = db
    .prepare("SELECT * FROM sessions WHERE id = ? AND user_id = ?")
    .get(session_id, userId);
  if (!session) return res.status(404).json({ error: "Session not found" });

  const user = db
    .prepare("SELECT id, ability, topic_stats FROM users WHERE id = ?")
    .get(userId);
  let topicStats: Record<string, { correct: number; total: number }> = {};
  try {
    topicStats = JSON.parse(user.topic_stats || "{}");
  } catch {}

  // Compute weak topics (lowest accuracy, at least 3 attempts)
  const topicsSorted = Object.entries(topicStats)
    .filter(([, v]) => v.total >= 3)
    .map(([k, v]) => [k, v.correct / Math.max(1, v.total)] as const)
    .sort((a, b) => a[1] - b[1])
    .map(([k]) => k);

  const answeredIdsRows = db
    .prepare("SELECT question_id FROM session_answers WHERE session_id = ?")
    .all(session_id);
  const answeredIds = new Set(answeredIdsRows.map((r) => r.question_id));

  // Get candidate questions (not yet answered), compute closeness to ability
  const candidates = db
    .prepare("SELECT * FROM questions")
    .all()
    .filter((q) => !answeredIds.has(q.id))
    .map((q) => {
      const rating = difficultyToRating(q.difficulty);
      const closeness = Math.abs(rating - user.ability);
      const qTopics = String(q.topics)
        .split(",")
        .map((s) => s.trim());
      const weakBoost = qTopics.some((t) =>
        topicsSorted.slice(0, 3).includes(t)
      )
        ? -100
        : 0; // prefer weak topics
      return { ...q, rating, closeness: closeness + weakBoost };
    })
    .sort((a, b) => a.closeness - b.closeness);

  if (candidates.length === 0) return res.json({ done: true });

  // Choose from the top 10 closest to ability (or fewer)
  const top = candidates.slice(0, Math.min(10, candidates.length));
  const next = top[Math.floor(Math.random() * top.length)];

  const payload = {
    id: next.id,
    question: next.question,
    options: JSON.parse(next.options_json),
    topics: next.topics,
    difficulty: next.difficulty,
  };
  return res.json(payload);
});

export default router;
