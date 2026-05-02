import "dotenv/config"; // ← MUST be first: loads .env before any local module runs
import express from "express";
import cors from "cors";
import helmet from "helmet";

import { globalLimiter } from "./middleware/rateLimit.middleware.js";
import cron from "node-cron";
import { DailyQuizService } from "./services/daily-quiz.service.js";

// Start background AI queue worker (in-memory) so jobs can be scheduled
import "./services/aiQueue.js";

import { connectDB } from "./config/db.js";
import quizRoutes from "./routes/quiz.routes.js";
import userRoutes from "./routes/user.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";


const app = express();

// Trust Render/Heroku/etc. reverse proxy so express-rate-limit gets real client IP
app.set("trust proxy", 1);

const PORT = parseInt(process.env.PORT || "5000", 10);

// ──────────────────────────────────────────────
// Security Middleware
// ──────────────────────────────────────────────

// Body parser
app.use(express.json({ limit: "1mb" }));

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


// Security Hardening
app.use(helmet());

// Global rate limiting
app.use(globalLimiter);



// ──────────────────────────────────────────────
// Routes
// ──────────────────────────────────────────────

// Health check (public, no auth) - used by UptimeRobot to keep server warm
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
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

  // Recover jobs stuck in 'running' from previous server crash/restart
  const { recoverStaleJobs } = await import("./services/aiQueue.js");
  await recoverStaleJobs();

  app.listen(PORT, () => {
    console.log(`[server] Running on http://localhost:${PORT}`);
    console.log(`[server] API: http://localhost:${PORT}/api`);
  });

  // ──────────────────────────────────────────────
  // Render Keep-Alive (Prevent Sleep)
  // ──────────────────────────────────────────────
  const RENDER_URL = process.env.RENDER_EXTERNAL_URL;
  if (RENDER_URL) {
    console.log(`[server] Keep-alive active: Pinging ${RENDER_URL}/api/health every 14 mins`);
    setInterval(async () => {
      try {
        const res = await fetch(`${RENDER_URL}/api/health`);
        if (res.ok) console.log("[keep-alive] Self-ping successful");
      } catch (err) {
        console.warn("[keep-alive] Self-ping failed:", err);
      }
    }, 14 * 60 * 1000); // 14 minutes
  }

  // Daily Quiz Cron (Midnight)

  cron.schedule("0 0 * * *", async () => {
    console.log("[cron] Running daily quiz refresh...");
    await DailyQuizService.refreshDailyQuizzes();
  });
}

main().catch(console.error);
