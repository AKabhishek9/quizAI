import express from "express";
import cors from "cors";
import helmet from "helmet";
import { globalLimiter } from "./middleware/rateLimit.middleware.js";
import dotenv from "dotenv";
import cron from "node-cron";
import { DailyQuizService } from "./services/daily-quiz.service.js";

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

app.use(globalLimiter);

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

  // Daily Quiz Cron (Midnight)
  cron.schedule("0 0 * * *", async () => {
    console.log("[cron] Running daily quiz refresh...");
    await DailyQuizService.refreshDailyQuizzes();
  });
}

main().catch(console.error);
