# AQA Economics MCQ Learning Platform (MVP)

A production-grade MVP for an adaptive A-level Economics (AQA) learning platform.

## Features
- **Multiple-choice questions (MCQs)** with topics and difficulty levels.
- **End-of-session automated scoring** (default 10 Qs per session).
- **Adaptive engine**: gradually serves harder questions as students improve using a simplified Elo update.
- **Student dashboard**: level, score trends over time, and weak areas by topic.

## Tech Stack
- **Backend**: Node.js, Express, SQLite (via `better-sqlite3`), JWT auth, Zod validation, TypeScript.
- **Frontend**: React (Vite + TypeScript), Tailwind CSS, Chart.js (via `react-chartjs-2`).

## Quick Start
> Prereqs: Node.js 18+ and npm.

### 1) Clone or Download
- Download the zip from your assistant’s link (or `git clone` this repo if you’ve hosted it).
- Open two terminals: one for `server/`, one for `client/`.

### 2) Backend (server)
```bash
cd server
cp .env.example .env
# Edit .env to set a strong JWT secret and (optionally) CORS origin(s).

npm install
npm run dev   # starts on http://localhost:4000 by default
```
On first start, the DB **auto-creates** and **seeds** from `seed/questions.csv`.

### 3) Frontend (client)
```bash
cd client
cp .env.example .env
# VITE_API_URL should point to your backend, e.g. http://localhost:4000

npm install
npm run dev   # starts the Vite dev server (default http://localhost:5173)
```
Log in / register, start a practice session, answer questions, finish to see scoring, then open the Dashboard to view your level, trends, and weak areas.

---

## Adaptive Engine (Simplified Elo)
- Each user has an **ability** score (starts at 1000).
- Each question has a **difficulty rating** mapped from 1–5 to {800, 1000, 1200, 1400, 1600}.
- After each attempt:  
  `ability = ability + K * (result - expected)`  
  where `expected = 1 / (1 + 10^((qRating - ability)/400))`, `result ∈ {0,1}`, and `K = 32`.
- Next question favors difficulty near the current ability, with periodic pulls from **weak topics** (lowest accuracy).

## Levels (derived from ability)
- **Foundation**: < 950
- **Core**: 950–1049
- **Strong**: 1050–1149
- **Advanced**: 1150–1249
- **Elite**: ≥ 1250

## Project Structure
```
aqa-econ-mvp/
  client/        # React + Vite app
  server/        # Node + Express + SQLite API
  README.md
```

## API Overview
- `POST /api/auth/register { name, email, password }`
- `POST /api/auth/login { email, password }`
- `POST /api/sessions/start` → starts session, returns first question
- `POST /api/sessions/answer` → submit answer, returns correctness + next question (or signals finish)
- `POST /api/sessions/finish` → finalize session (if not already auto-finished)
- `GET  /api/dashboard` → ability, level, recent session scores, topic stats

All authenticated routes require `Authorization: Bearer <token>`.
