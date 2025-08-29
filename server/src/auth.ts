import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { db } from "./db";

const router = Router();

const RegisterSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

function signToken(payload: any) {
  const secret = process.env.JWT_SECRET || "dev_secret";
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export function requireAuth(req: any, res: any, next: any) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const secret = process.env.JWT_SECRET || "dev_secret";
    const decoded = jwt.verify(token, secret);
    (req as any).user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

router.post("/register", (req, res) => {
  const parse = RegisterSchema.safeParse(req.body);
  if (!parse.success)
    return res.status(400).json({ error: parse.error.flatten() });

  const { name, email, password } = parse.data;
  const hashed = bcrypt.hashSync(password, 10);
  try {
    const stmt = db.prepare(
      `INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)`
    );
    const info = stmt.run(name, email.toLowerCase(), hashed);
    const token = signToken({
      id: info.lastInsertRowid,
      email: email.toLowerCase(),
    });
    return res.json({ token });
  } catch (e: any) {
    if (e && String(e).includes("UNIQUE")) {
      return res.status(409).json({ error: "Email already registered" });
    }
    return res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", (req, res) => {
  const parse = LoginSchema.safeParse(req.body);
  if (!parse.success)
    return res.status(400).json({ error: parse.error.flatten() });

  const { email, password } = parse.data;
  const user = db
    .prepare(`SELECT * FROM users WHERE email = ?`)
    .get(email.toLowerCase());
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = bcrypt.compareSync(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = signToken({ id: user.id, email: user.email });
  return res.json({ token });
});

export default router;
