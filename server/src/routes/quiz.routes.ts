import { Router } from "express";
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

// Securing endpoints via Firebase JWT + Zod validation + rate limiting
router.post("/get-quiz", requireAuth, aiLimiter, validateBody(GetQuizSchema), getQuiz);
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
