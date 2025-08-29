import "dotenv/config";
import express from "express";
import cors from "cors";
import { db } from "./db";
import { initSchema, seedQuestionsIfEmpty } from "./models";
import authRoutes from "./auth";
import questionsRoutes from "./routes/questions";
import sessionsRoutes from "./routes/sessions";
import dashboardRoutes from "./routes/dashboard";

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: (process.env.CORS_ORIGIN || "*").split(",").map((s) => s.trim()),
  })
);

initSchema();
seedQuestionsIfEmpty();

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/questions", questionsRoutes);
app.use("/api/sessions", sessionsRoutes);
app.use("/api/dashboard", dashboardRoutes);

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`API ready on http://localhost:${port}`);
});
