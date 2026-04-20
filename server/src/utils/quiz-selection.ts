import mongoose from "mongoose";
import { QuestionModel } from "../models/Question.js";

export interface SelectionCriteria {
  stream: string;
  topics: string[];
  targetedLevel: number;
  excludeIds: mongoose.Types.ObjectId[];
  limit: number;
}

export async function fetchWeakQuestions(
  criteria: SelectionCriteria,
  weakConcepts: string[]
): Promise<any[]> {
  const { stream, topics, targetedLevel, excludeIds, limit } = criteria;
  
  if (weakConcepts.length === 0 || limit <= 0) {
    return [];
  }

  let weakQuestions = await QuestionModel.aggregate([
    { $match: { stream, topic: { $in: topics }, concept: { $in: weakConcepts }, difficulty: targetedLevel, _id: { $nin: excludeIds } } },
    { $sample: { size: limit } },
    { $project: { question: 1, options: 1, topic: 1, concept: 1, difficulty: 1 } }
  ]);

  if (weakQuestions.length < limit) {
    const remainingIds = [...excludeIds, ...weakQuestions.map((r: any) => r._id)];
    const widenedWeak = await QuestionModel.aggregate([
      { $match: { stream, topic: { $in: topics }, concept: { $in: weakConcepts }, difficulty: { $gte: Math.max(1, targetedLevel - 1), $lte: Math.min(5, targetedLevel + 1) }, _id: { $nin: remainingIds } } },
      { $sample: { size: limit - weakQuestions.length } },
      { $project: { question: 1, options: 1, topic: 1, concept: 1, difficulty: 1 } }
    ]);
    weakQuestions = [...weakQuestions, ...widenedWeak];
  }

  return weakQuestions;
}

export async function fetchRandomQuestions(
  criteria: SelectionCriteria
): Promise<any[]> {
  const { stream, topics, targetedLevel, excludeIds, limit } = criteria;

  if (limit <= 0) {
    return [];
  }

  let randomQuestions = await QuestionModel.aggregate([
    { $match: { stream, topic: { $in: topics }, difficulty: targetedLevel, _id: { $nin: excludeIds } } },
    { $sample: { size: limit } },
    { $project: { question: 1, options: 1, topic: 1, concept: 1, difficulty: 1 } }
  ]);

  if (randomQuestions.length < limit) {
    const remainingIds = [...excludeIds, ...randomQuestions.map((r: any) => r._id)];
    const widenedRandom = await QuestionModel.aggregate([
      { $match: { stream, topic: { $in: topics }, difficulty: { $gte: Math.max(1, targetedLevel - 1), $lte: Math.min(5, targetedLevel + 1) }, _id: { $nin: remainingIds } } },
      { $sample: { size: limit - randomQuestions.length } },
      { $project: { question: 1, options: 1, topic: 1, concept: 1, difficulty: 1 } }
    ]);
    randomQuestions = [...randomQuestions, ...widenedRandom];
  }

  return randomQuestions;
}
