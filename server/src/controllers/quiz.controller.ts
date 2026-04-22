import { Request, Response, NextFunction } from "express";
import { getDynamicQuiz, submitQuiz, getQuizAttemptById, getAllAvailableQuizzes } from "../services/quiz.service.js";
import { DailyQuizService } from "../services/daily-quiz.service.js";
import { AppError } from "../lib/AppError.js";

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
    // Body is already validated by Zod middleware (stream, topics, difficulty, useFallback)
    const { stream, topics, difficulty, useFallback } = req.body;

    // Security: userId derived from verified JWT, never from body
    const userId = req.user!.uid;

    const quiz = await getDynamicQuiz({ 
      userId, 
      stream: String(stream), 
      topics: Array.isArray(topics) ? topics.map(String) : [String(topics)], 
      difficulty, 
      useFallback 
    });

    
    // If generation timed out but was queued, return 202
    if (quiz && (quiz as any).status === "generating") {
      res.status(202).json({
        success: true,
        ...(quiz as any)
      });
      return;
    }

    res.json({
      success: true,
      data: quiz
    });
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
    res.json({
      success: true,
      data: result
    });
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
      throw new AppError("Quiz attempt not found", 404, "ATTEMPT_NOT_FOUND");
    }

    // Authorization: only the owner can view their attempt
    if (attempt.userId !== userId) {
      throw new AppError("Unauthorized access to this attempt", 403, "UNAUTHORIZED_ACCESS");
    }

    res.json({
      success: true,
      data: attempt
    });
  } catch (error) {
    next(error);
  }
};


// @route   GET /api/quiz/daily
// @desc    Get today's daily quizzes
// @access  Protected
export const getDailyQuizzes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const quizzes = await DailyQuizService.getDailyQuizzes();
    res.json({
      success: true,
      data: quizzes
    });
  } catch (error) {
    next(error);
  }
};


// @route   GET /api/quiz/daily/:id
// @desc    Get a specific daily quiz with questions
// @access  Protected
export const getDailyQuiz = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const quiz = await DailyQuizService.getDailyQuizByCategoryId(req.params.id as string);
    if (!quiz) {
      throw new AppError("Daily quiz not found for today", 404, "DAILY_QUIZ_NOT_FOUND");
    }
    res.json({
      success: true,
      data: quiz
    });
  } catch (error) {
    next(error);
  }
};


// @route   POST /api/quiz/daily/:id/submit
// @desc    Submit answers for a daily quiz and update streak
// @access  Protected
export const submitDailyQuiz = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categoryId = req.params.id as string;
    const userId = req.user!.uid;
    const { answers } = req.body; // Array of { questionId, selectedOption }

    // Fetch the ground truth answers from DB
    const questionsWithAnswers = await DailyQuizService.getDailyQuizAnswers(categoryId);
    if (!questionsWithAnswers || questionsWithAnswers.length === 0) {
      throw new AppError("Daily quiz questions not found", 404, "DAILY_QUESTIONS_NOT_FOUND");
    }


    // Grade the submission
    let correctCount = 0;
    const results = questionsWithAnswers.map((q) => {
      const userSubmission = answers.find((a: any) => a.questionId === q._id.toString());
      const isCorrect = userSubmission?.selectedOption === q.answer;
      if (isCorrect) correctCount++;
      return { 
        question: q.question, 
        isCorrect, 
        correctAnswer: q.answer,
        userAnswer: userSubmission?.selectedOption
      };
    });

    const score = Math.round((correctCount / questionsWithAnswers.length) * 100);

    // Create a QuizAttempt record for analytics/history
    const { QuizAttemptModel } = await import("../models/QuizAttempt.js");
    await QuizAttemptModel.create({
      userId,
      stream: "Daily Quest", // Updated for better identification
      topics: [categoryId],
      score,
      totalQuestions: questionsWithAnswers.length,
      difficulty: 3,
      answers: results.map((r, i) => ({
        questionId: questionsWithAnswers[i]._id,
        selectedOption: r.userAnswer,
        isCorrect: r.isCorrect
      }))
    });

    // Update Streak and award XP based on question count
    // 10 questions = 50 XP, 20 questions = 100 XP
    const xpToAward = questionsWithAnswers.length >= 20 ? 100 : 50;
    const streakInfo = await DailyQuizService.updateUserStreak(userId, xpToAward);

    res.json({
      success: true,
      data: {
        score,
        total: questionsWithAnswers.length,
        correct: correctCount,
        results,
        streak: streakInfo,
      }
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
    res.json({ 
      success: true,
      message: "Daily quizzes refreshed successfully" 
    });
  } catch (error) {
    next(error);
  }
};


// @route   GET /api/quiz/all
// @desc    Get all available quiz subjects/streams
// @access  Public
export const listQuizzes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const quizzes = await getAllAvailableQuizzes();
    res.json({
      success: true,
      data: quizzes
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/quiz-job/:id
// @desc    Poll status of a background quiz generation job
// @access  Protected
export const getQuizJobStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { getJob } = await import("../services/aiQueue.js");
    
    const job = await getJob(String(id));
    if (!job) {
      throw new AppError("Job not found", 404, "JOB_NOT_FOUND");
    }

    res.json({
      success: true,
      data: {
        status: job.status,
        error: job.error,
        result: (job as any).result, // The generated questions
      }
    });

  } catch (error) {
    next(error);
  }
};

