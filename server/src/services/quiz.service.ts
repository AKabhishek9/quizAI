import mongoose from "mongoose";
import { QuestionModel } from "../models/Question.js";
import { UserModel, MAX_ATTEMPTED } from "../models/User.js";
import { QuizAttemptModel } from "../models/QuizAttempt.js";
import type { SubmitPayload, SubmitResponse, QuizResponse, DynamicQuizRequest } from "../types/index.js";
import { logger } from "../utils/logger.js";
import { fetchWeakQuestions, fetchRandomQuestions, type SelectionCriteria } from "../utils/quiz-selection.js";
import { gradeQuizAnswers, updateConceptStats, calculateLevelChange, calculateXPAwarded } from "../utils/quiz-scoring.js";

const QUIZ_SIZE = 10;

/* ──────────────────────────────────────────────
 * GET QUIZ — Adaptive question selection
 * ──────────────────────────────────────────────
 * Strategy:
 *   1. Identify weak concepts (accuracy < 0.5)
 *   2. Pull 60% from weak concepts at user level
 *   3. Fill remaining 40% randomly at user level
 *   4. Exclude already-attempted questions
 *   5. If not enough questions, widen difficulty ±1
 * ────────────────────────────────────────────── */
export async function getDynamicQuiz({
  userId,
  stream,
  topics,
  difficulty,
  useFallback = false,
}: DynamicQuizRequest): Promise<QuizResponse> {
  // Get or create user
  let user = await UserModel.findOne({ userId });
  if (!user) {
    user = await UserModel.create({ userId });
  }

  // Update preferred stream if changed/new
  if (stream && !user.preferredStreams.includes(stream)) {
    user.preferredStreams.push(stream);
    await user.save();
  }

  const excludeIds = (user.attemptedQuestions ?? []).map(
    (id) => new mongoose.Types.ObjectId(String(id))
  );

  const targetedLevel = difficulty ?? user.currentLevel ?? 1;

  // Get weak concepts
  const weakConcepts = Array.from(user.conceptStats.entries())
    .filter(([, stat]) => stat.accuracy < 0.5)
    .map(([concept]) => concept);

  const topicCount = topics.length;
  const sanitizedTopics = topicCount > 0 ? topics : ["General Data"];

  let finalQuestions: any[] = [];

  const selectionCriteria: SelectionCriteria = {
    stream,
    topics: sanitizedTopics,
    targetedLevel,
    excludeIds,
    limit: 0,
  };

  // First, fetch weak concept questions (60%)
  if (weakConcepts.length > 0) {
    const weakLimit = Math.ceil(QUIZ_SIZE * 0.6);
    selectionCriteria.limit = weakLimit;
    const weakQuestions = await fetchWeakQuestions(selectionCriteria, weakConcepts);
    finalQuestions = weakQuestions;
  }

  const currentCount = finalQuestions.length;
  const remainingLimit = QUIZ_SIZE - currentCount;

  // Fill remaining with random questions (40%)
  if (remainingLimit > 0) {
    const randomExcludeIds = [...excludeIds, ...finalQuestions.map((q: any) => q._id)];
    selectionCriteria.excludeIds = randomExcludeIds;
    selectionCriteria.limit = remainingLimit;
    
    const randomQuestions = await fetchRandomQuestions(selectionCriteria);
    finalQuestions = [...finalQuestions, ...randomQuestions];
  }

  // If still short, trigger AI generation to reach the full QUIZ_SIZE
  const deficit = QUIZ_SIZE - finalQuestions.length;
  
  if (deficit > 0) {
    logger.info(`Quiz short by ${deficit} questions. Triggering synchronous AI generation to reach target of ${QUIZ_SIZE}.`);
    try {
      const { generateQuestions } = await import("./ai.service.js");
      
      // Timeout guard: 15 seconds
      const generationPromise = generateQuestions({
        stream,
        topics: sanitizedTopics,
        difficulty: targetedLevel,
        count: QUIZ_SIZE, // Request a full batch to ensure quality/diversity
      });

      const timeoutPromise = new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error("TIMEOUT")), 15000)
      );

      const generated = await Promise.race([generationPromise, timeoutPromise]);
      
      if (generated && generated.length > 0) {
        // Use generated questions to fill the deficit
        // We filter out any that we might have already pulled from the DB
        const existingIds = new Set(finalQuestions.map(q => String(q._id)));
        const newQuestions = generated.filter(q => !existingIds.has(String(q._id)));
        
        finalQuestions = [...finalQuestions, ...newQuestions];
      }
    } catch (err: any) {
      if (err.message === "TIMEOUT") {
        logger.warn("[ai] Synchronous generation timed out. Queueing job for client polling.");
        const { addJob } = await import("./aiQueue.js");
        const jobId = await addJob({
          stream,
          topics: sanitizedTopics,
          difficulty: targetedLevel,
          count: QUIZ_SIZE,
        });
        return { status: "generating", jobId } as any;
      }
      
      logger.error({ err: String(err) }, "Sync AI generation failed");
      
      // If AI failed but we have SOME questions (like the 5 from DB), just serve those
      // instead of throwing an error. Only throw if we have 0 questions.
      if (finalQuestions.length === 0) {
        throw new Error("Could not find or generate questions for this topic. Please try again later.");
      }
    }
  }

  // Shuffle Fisher-Yates
  for (let i = finalQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [finalQuestions[i], finalQuestions[j]] = [finalQuestions[j], finalQuestions[i]];
  }

  return {
    questions: finalQuestions.slice(0, QUIZ_SIZE).map((q: unknown) => {
      const raw = q as Record<string, unknown>;
      return {
        _id: String(raw._id),
        question: String(raw.question ?? ""),
        options: (raw.options as string[]) ?? [],
        topic: String(raw.topic ?? "General"),
        concept: String(raw.concept ?? ""),
        difficulty: Number(raw.difficulty ?? 1),
      };
    }),
  };
}

/* ──────────────────────────────────────────────
 * SUBMIT QUIZ — Grade & update user stats
 * ──────────────────────────────────────────────
 * Steps:
 *   1. Fetch correct answers for submitted questions
 *   2. Grade each answer
 *   3. Update per-concept stats
 *   4. Adjust user difficulty level
 *   5. Cap attemptedQuestions array (FIFO)
 * ────────────────────────────────────────────── */
export async function submitQuiz(payload: SubmitPayload): Promise<SubmitResponse> {
  const { userId, answers } = payload;

  // Idempotency check: prevent double-submit within 10 seconds
  const recentAttempt = await QuizAttemptModel.findOne({
    userId,
    createdAt: { $gte: new Date(Date.now() - 10000) }
  });
  if (recentAttempt) {
    throw new Error("Duplicate submission detected. Please wait before submitting again.");
  }

  // Get user
  let user = await UserModel.findOne({ userId });
  if (!user) {
    user = await UserModel.create({ userId });
  }

  // Fetch the questions
  const questionIds = answers.map((a) => new mongoose.Types.ObjectId(a.questionId));
  const questions = await QuestionModel.find({ _id: { $in: questionIds } }).lean();

  const questionMap = new Map(questions.map((q) => [String(q._id), q]));

  // Grade
  // Prepare questions for grading utility
  const gradeQuestionMap = new Map<string, { answer: number; concept: string }>();
  for (const [id, q] of questionMap) {
    gradeQuestionMap.set(id, { answer: q.answer, concept: q.concept });
  }

  const { correct, total, accuracy, conceptTally } = gradeQuizAnswers(answers, gradeQuestionMap);

  // Update conceptStats
  if (!user.conceptStats) user.conceptStats = new Map();
  updateConceptStats(user.conceptStats, conceptTally);

  // Adjust difficulty level
  const prevLevel = user.currentLevel;
  const levelChange = calculateLevelChange(accuracy, prevLevel);
  user.currentLevel = prevLevel + levelChange;

  // Push attempted questions (capped FIFO)
  const newAttempted = [...(user.attemptedQuestions ?? []), ...questionIds];
  if (newAttempted.length > MAX_ATTEMPTED) {
    // Trim from the front (oldest)
    user.attemptedQuestions = newAttempted.slice(newAttempted.length - MAX_ATTEMPTED);
  } else {
    user.attemptedQuestions = newAttempted;
  }

  // Award XP
  const xpAwarded = calculateXPAwarded(accuracy);
  user.xp = (user.xp ?? 0) + xpAwarded;

  await user.save();

  // Create a QuizAttempt historical record for the dashboard
  const uniqueTopics = Array.from(new Set(questions.map((q) => q.topic).filter(Boolean)));
  
  const attemptAnswers = answers.map(ans => {
    const q = questionMap.get(ans.questionId);
    return {
      questionId: new mongoose.Types.ObjectId(ans.questionId),
      selectedOption: ans.selectedOption,
      isCorrect: q ? q.answer === ans.selectedOption : false
    };
  });

  const attempt = await QuizAttemptModel.create({
    userId,
    stream: "Mixed", 
    topics: uniqueTopics.length > 0 ? uniqueTopics : ["General"],
    score: Math.round(accuracy * 100),
    totalQuestions: total,
    difficulty: prevLevel,
    answers: attemptAnswers
  });

  return {
    score: correct,
    total,
    accuracy: Math.round(accuracy * 100),
    levelChange,
    newLevel: user.currentLevel,
    xpAwarded,
    attemptId: String(attempt._id),
    conceptBreakdown: Array.from(conceptTally.entries()).map(([concept, t]) => ({
      concept,
      correct: t.correct,
      total: t.total,
    })),
  };
}
export async function getQuizAttemptById(attemptId: string) {
  const attempt = await QuizAttemptModel.findById(attemptId).lean();
  if (!attempt) return null;

  // We need to fetch the full question objects for each answer in the attempt
  const questionIds = (attempt.answers || []).map(a => a.questionId);
  const questions = await QuestionModel.find({ _id: { $in: questionIds } }).lean();
  const questionMap = new Map(questions.map(q => [String(q._id), q]));

  // Combine attempt data with full question details
  return {
    ...attempt,
    _id: String(attempt._id),
    answers: (attempt.answers || []).map(a => {
      const q = questionMap.get(String(a.questionId));
      return {
        ...a,
        question: q ? {
          question: q.question,
          options: q.options,
          answer: q.answer,
          concept: q.concept,
          topic: q.topic
        } : null
      };
    })
  };
}

let quizCache: { data: any[]; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Aggregates unique subjects and streams from existing questions
 * to present available quizzes for the Library.
 */
export async function getAllAvailableQuizzes() {
  if (quizCache && (Date.now() - quizCache.timestamp) < CACHE_TTL) {
    logger.info("[cache] Serving available quizzes from memory");
    return quizCache.data;
  }

  const aggregated = await QuestionModel.aggregate([
    {
      $group: {
        _id: { subject: "$subject", stream: "$stream" },
        count: { $sum: 1 },
        topics: { $addToSet: "$topic" }
      }
    },
    {
      $project: {
        _id: 0,
        subject: "$_id.subject",
        stream: "$_id.stream",
        count: "$count",
        topics: { $slice: ["$topics", 5] } // Limit topics for UI
      }
    }
  ]);

  const result = aggregated.map(a => ({
    id: `${a.subject}-${a.stream}`.toLowerCase().replace(/\s+/g, '-'),
    title: a.subject,
    description: `Master ${a.subject} within the ${a.stream} stream. ${a.count} questions available.`,
    subject: a.subject,
    stream: a.stream,
    topics: a.topics,
    difficulty: "Mixed"
  }));

  quizCache = { data: result, timestamp: Date.now() };
  return result;
}
