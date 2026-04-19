import mongoose from "mongoose";
import { QuestionModel } from "../models/Question.js";
import { UserModel, MAX_ATTEMPTED } from "../models/User.js";
import { QuizAttemptModel } from "../models/QuizAttempt.js";
import type { SubmitPayload, SubmitResponse, QuizResponse, DynamicQuizRequest } from "../types/index.js";
import { logger } from "../utils/logger.js";

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

  let finalQuestions: unknown[] = [];

  // First, fetch weak concept questions (60%)
  if (weakConcepts.length > 0) {
    const weakLimit = Math.ceil(QUIZ_SIZE * 0.6);
    let weakQuestions = await QuestionModel.aggregate([
      { $match: { stream, topic: { $in: sanitizedTopics }, concept: { $in: weakConcepts }, difficulty: targetedLevel, _id: { $nin: excludeIds } } },
      { $sample: { size: weakLimit } },
      { $project: { question: 1, options: 1, topic: 1, concept: 1, difficulty: 1 } }
    ]);

    if (weakQuestions.length < weakLimit) {
      const remainingIds = [...excludeIds, ...weakQuestions.map((r: unknown) => (r as Record<string, unknown>). _id)];
      const widenedWeak = await QuestionModel.aggregate([
        { $match: { stream, topic: { $in: sanitizedTopics }, concept: { $in: weakConcepts }, difficulty: { $gte: Math.max(1, targetedLevel - 1), $lte: Math.min(5, targetedLevel + 1) }, _id: { $nin: remainingIds } } },
        { $sample: { size: weakLimit - weakQuestions.length } },
        { $project: { question: 1, options: 1, topic: 1, concept: 1, difficulty: 1 } }
      ]);
      weakQuestions = [...weakQuestions, ...widenedWeak];
    }

    finalQuestions = weakQuestions;
  }

  const currentCount = finalQuestions.length;
  const remainingLimit = QUIZ_SIZE - currentCount;

  // Fill remaining with random questions (40%)
  if (remainingLimit > 0) {
    const randomExcludeIds = [...excludeIds, ...finalQuestions.map((q: unknown) => (q as Record<string, unknown>)._id)];
    let randomQuestions = await QuestionModel.aggregate([
      { $match: { stream, topic: { $in: sanitizedTopics }, difficulty: targetedLevel, _id: { $nin: randomExcludeIds } } },
      { $sample: { size: remainingLimit } },
      { $project: { question: 1, options: 1, topic: 1, concept: 1, difficulty: 1 } }
    ]);

    if (randomQuestions.length < remainingLimit) {
      const remainingIds = [...randomExcludeIds, ...randomQuestions.map((r: unknown) => (r as Record<string, unknown>)._id)];
      const widenedRandom = await QuestionModel.aggregate([
        { $match: { stream, topic: { $in: sanitizedTopics }, difficulty: { $gte: Math.max(1, targetedLevel - 1), $lte: Math.min(5, targetedLevel + 1) }, _id: { $nin: remainingIds } } },
        { $sample: { size: remainingLimit - randomQuestions.length } },
        { $project: { question: 1, options: 1, topic: 1, concept: 1, difficulty: 1 } }
      ]);
      randomQuestions = [...randomQuestions, ...widenedRandom];
    }

    finalQuestions = [...finalQuestions, ...randomQuestions];
  }

  // If still short, schedule AI generation as a background job (non-blocking)
  const deficit = QUIZ_SIZE - finalQuestions.length;
  if (deficit > 0) {
    logger.info(`Shortfall detected: ${deficit}. Scheduling background AI generation.`);
    try {
      const { addJob } = await import("./aiQueue.js");
      const jobId = addJob({
        stream,
        topics: sanitizedTopics,
        difficulty: targetedLevel,
        count: Math.max(20, deficit * 2),
      });
      logger.info(`AI generation job scheduled: ${jobId}`);
    } catch (err) {
      logger.error({ err: String(err) }, "Failed to schedule AI job");
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
  let correct = 0;
  const conceptTally = new Map<string, { correct: number; total: number }>();

  for (const ans of answers) {
    const q = questionMap.get(ans.questionId);
    if (!q) continue;

    const isCorrect = q.answer === ans.selectedOption;
    if (isCorrect) correct++;

    // Tally per concept
    const tally = conceptTally.get(q.concept) ?? { correct: 0, total: 0 };
    tally.total++;
    if (isCorrect) tally.correct++;
    conceptTally.set(q.concept, tally);
  }

  const total = answers.length;
  const accuracy = total > 0 ? correct / total : 0;

  // Update conceptStats
  for (const [concept, tally] of conceptTally) {
    const existing = user.conceptStats?.get(concept) ?? {
      attempted: 0,
      correct: 0,
      accuracy: 0,
    };

    const newAttempted = existing.attempted + tally.total;
    const newCorrect = existing.correct + tally.correct;
    const newAccuracy = newAttempted > 0 ? newCorrect / newAttempted : 0;

    user.conceptStats?.set(concept, {
      attempted: newAttempted,
      correct: newCorrect,
      accuracy: Math.round(newAccuracy * 1000) / 1000, // 3 decimal precision
    });
  }

  // Adjust difficulty level
  let levelChange = 0;
  const prevLevel = user.currentLevel;

  if (accuracy >= 0.8 && prevLevel < 5) {
    levelChange = 1;
  } else if (accuracy < 0.4 && prevLevel > 1) {
    levelChange = -1;
  }
  user.currentLevel = prevLevel + levelChange;

  // Push attempted questions (capped FIFO)
  const newAttempted = [...(user.attemptedQuestions ?? []), ...questionIds];
  if (newAttempted.length > MAX_ATTEMPTED) {
    // Trim from the front (oldest)
    user.attemptedQuestions = newAttempted.slice(newAttempted.length - MAX_ATTEMPTED);
  } else {
    user.attemptedQuestions = newAttempted;
  }

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
