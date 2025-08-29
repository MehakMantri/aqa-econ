import { Router } from "express";
import { db } from "../db";
import { requireAuth } from "../auth";
import { abilityToLevel } from "../adaptive";

const router = Router();

router.get("/", requireAuth, (req: any, res) => {
  const userId = req.user.id;
  const user = db
    .prepare("SELECT id, ability, topic_stats FROM users WHERE id = ?")
    .get(userId);
  let topicStats: Record<string, { correct: number; total: number }> = {};
  try {
    topicStats = JSON.parse(user.topic_stats || "{}");
  } catch {}

  const sessions = db
    .prepare(
      `
    SELECT id, started_at, finished_at, score, total, correct
    FROM sessions
    WHERE user_id = ? AND score IS NOT NULL
    ORDER BY started_at ASC
  `
    )
    .all(userId);

  const trend = sessions.map((s) => ({
    date: s.started_at,
    score: s.score || 0,
  }));

  const topics = Object.entries(topicStats)
    .map(([topic, v]) => ({
      topic,
      correct: v.correct,
      total: v.total,
      accuracy: v.total ? Math.round((v.correct / v.total) * 100) : 0,
    }))
    .sort((a, b) => a.accuracy - b.accuracy);

  res.json({
    ability: user.ability,
    level: abilityToLevel(user.ability),
    sessions: trend,
    topics,
  });
});

export default router;
