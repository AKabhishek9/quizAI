import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

// Start background AI queue worker (in-memory) so jobs can be scheduled
import "./services/aiQueue.js";

import { connectDB } from "./config/db.js";
import quizRoutes from "./routes/quiz.routes.js";
import userRoutes from "./routes/user.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "5000", 10);

// ──────────────────────────────────────────────
// Security Middleware
// ──────────────────────────────────────────────

// Helmet: sets security HTTP headers (X-Content-Type-Options, HSTS, etc.)
app.use(helmet());

// CORS: whitelist allowed origins instead of wide-open
const ALLOWED_ORIGINS = (
  process.env.CORS_ORIGINS || "http://localhost:3000"
).split(",");

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (server-to-server, curl, health checks)
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origin ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);

// Global rate limiter: 100 requests per minute per IP
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please slow down." },
});
app.use(globalLimiter);

// Stricter rate limiter for AI-heavy endpoints (applied per route)
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10, // 10 quiz generation requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Quiz generation rate limit reached. Please wait a moment." },
});

// Body parser
app.use(express.json({ limit: "1mb" }));

// ──────────────────────────────────────────────
// Routes
// ──────────────────────────────────────────────

// Health check (public, no auth)
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api", quizRoutes);
app.use("/api", userRoutes);

// Error handler (must be last)
app.use(errorHandler);

// ──────────────────────────────────────────────
// Start
// ──────────────────────────────────────────────
async function main() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`[server] Running on http://localhost:${PORT}`);
    console.log(`[server] API: http://localhost:${PORT}/api`);
  });
}

main().catch(console.error);
