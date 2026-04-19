import { Router } from "express";
import { 
  getQuiz, 
  submitQuizHandler, 
  getQuizAttempt,
  getDailyQuizzes,
  getDailyQuiz,
  submitDailyQuiz,
  refreshDailyQuizzes
} from "../controllers/quiz.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import {
  validateBody,
  validateParams,
  GetQuizSchema,
  SubmitQuizSchema,
  AttemptIdParamSchema,
} from "../middleware/validate.js";
import { aiLimiter } from "../middleware/rateLimit.middleware.js";

const router = Router();

// Securing endpoints via Firebase JWT + Zod validation + rate limiting
router.post("/get-quiz", requireAuth, aiLimiter, validateBody(GetQuizSchema), getQuiz);
router.post("/submit-quiz", requireAuth, validateBody(SubmitQuizSchema), submitQuizHandler);
router.get("/quiz-attempt/:id", requireAuth, validateParams(AttemptIdParamSchema), getQuizAttempt);

// Daily Quiz Routes
router.get("/daily", requireAuth, getDailyQuizzes);
router.get("/daily/:id", requireAuth, getDailyQuiz);
router.post("/daily/:id/submit", requireAuth, submitDailyQuiz);
router.post("/daily/refresh", requireAuth, refreshDailyQuizzes);

export default router;
