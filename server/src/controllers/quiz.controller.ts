import { getDynamicQuiz, submitQuiz, getQuizAttemptById } from "../services/quiz.service.js";
import { DailyQuizService } from "../services/daily-quiz.service.js";
import type { SubmitPayload } from "../types/index.js";

// @route   POST /api/get-quiz
// @desc    Get mixed adaptive quiz based on stream and topics
// @access  Protected (JWT + Zod validated + rate limited)
export const getQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Body is already validated by Zod middleware (stream, topics, difficulty)
    const { stream, topics, difficulty } = req.body;

    // Security: userId derived from verified JWT, never from body
    const userId = req.user!.uid;

    const quiz = await getDynamicQuiz({ userId, stream, topics, difficulty });
    
    res.json(quiz);
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/submit-quiz
// @desc    Submit quiz answers for grading
// @access  Protected (JWT + Zod validated)
export const submitQuizHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Body is already validated by Zod middleware (answers array with valid ObjectIds)
    const payload = req.body as SubmitPayload;
    
    // Security: override userId with the JWT-verified UID
    payload.userId = req.user!.uid;

    const result = await submitQuiz(payload);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/quiz-attempt/:id
// @desc    Get a specific quiz attempt for review
// @access  Protected (JWT + param validated)
export const getQuizAttempt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // :id param is already validated as a valid ObjectId by Zod middleware
    const id = req.params.id as string;
    const userId = req.user!.uid;

    const attempt = await getQuizAttemptById(id);
    
    if (!attempt) {
      res.status(404).json({ error: "Quiz attempt not found" });
      return;
    }

    // Authorization: only the owner can view their attempt
    if (attempt.userId !== userId) {
      res.status(403).json({ error: "Unauthorized access to this attempt" });
      return;
    }

    res.json(attempt);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/quiz/daily
// @desc    Get today's daily quizzes
// @access  Protected
export const getDailyQuizzes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const quizzes = await DailyQuizService.getTodayQuizzes();
    res.json(quizzes);
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/quiz/daily/:id
// @desc    Get a specific daily quiz with questions
// @access  Protected
export const getDailyQuiz = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const quiz = await DailyQuizService.getDailyQuizById(req.params.id);
    if (!quiz) {
      res.status(404).json({ error: "Daily quiz not found" });
      return;
    }
    res.json(quiz);
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/quiz/daily/:id/submit
// @desc    Submit answers for a daily quiz and update streak
// @access  Protected
export const submitDailyQuiz = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const quizId = req.params.id;
    const userId = req.user!.uid;
    const { answers } = req.body; // Array of { questionId, selectedOption }

    const quiz = await DailyQuizService.getDailyQuizById(quizId);
    if (!quiz) {
      res.status(404).json({ error: "Daily quiz not found" });
      return;
    }

    // Simple grading
    let correctCount = 0;
    const results = quiz.questions.map((q, idx) => {
      const userAnswer = answers[idx]?.selectedOption;
      const isCorrect = userAnswer === q.answer;
      if (isCorrect) correctCount++;
      return { question: q.question, isCorrect, correctAnswer: q.answer };
    });

    const score = Math.round((correctCount / quiz.questions.length) * 100);

    // Update Streak
    const streakInfo = await DailyQuizService.updateUserStreak(userId);

    res.json({
      score,
      total: quiz.questions.length,
      correct: correctCount,
      results,
      streak: streakInfo,
    });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/quiz/daily/refresh
// @desc    Manually trigger refresh (Admin only - for now just protected)
// @access  Protected
export const refreshDailyQuizzes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await DailyQuizService.refreshDailyQuizzes();
    res.json({ message: "Daily quizzes refreshed successfully" });
  } catch (error) {
    next(error);
  }
};
