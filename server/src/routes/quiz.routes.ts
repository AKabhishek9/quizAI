import { Router } from "express";
import rateLimit from "express-rate-limit";
import { 
  getQuiz, 
  submitQuizHandler, 
  getQuizAttempt,
  getDailyQuizzes,
  getDailyQuiz,
  submitDailyQuiz,
  refreshDailyQuizzes,
  listQuizzes,
  getQuizJobStatus
} from "../controllers/quiz.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  validateBody,
  validateParams,
  GetQuizSchema,
  SubmitQuizSchema,
  AttemptIdParamSchema,
  DailySubmitSchema,
} from "../middleware/validate.js";
import { aiLimiter } from "../middleware/rateLimit.middleware.js";

const router = Router();

// Per-user rate limiting for quiz generation (prevent hammering AI endpoint)
const perUserQuizLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  validate: false,
  keyGenerator: (req) => {
    return String((req as any).user?.uid || req.ip || "unknown");
  },
  message: {
    error: "Too many quiz requests. Please wait 60 seconds.",
    code: "RATE_LIMIT_EXCEEDED"
  },
});

// Securing endpoints via Firebase JWT + Zod validation + rate limiting
router.post("/get-quiz", requireAuth, perUserQuizLimiter, aiLimiter, validateBody(GetQuizSchema), getQuiz);
router.post("/submit-quiz", requireAuth, validateBody(SubmitQuizSchema), submitQuizHandler);
router.get("/quiz-attempt/:id", requireAuth, validateParams(AttemptIdParamSchema), getQuizAttempt);
router.get("/quiz-job/:id", requireAuth, getQuizJobStatus);

// Daily Quiz Routes — IMPORTANT: static routes MUST come before dynamic `:id` routes
router.get("/daily", requireAuth, getDailyQuizzes);
router.post("/daily/refresh", requireAuth, refreshDailyQuizzes);  // Static route first
router.get("/daily/:id", requireAuth, getDailyQuiz);
router.post("/daily/:id/submit", requireAuth, validateBody(DailySubmitSchema), submitDailyQuiz);  // Dynamic route after
router.get("/quiz/all", listQuizzes);

export default router;
