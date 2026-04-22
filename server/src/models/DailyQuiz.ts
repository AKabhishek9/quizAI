import mongoose, { Schema } from "mongoose";

/**
 * Schema for the Daily Quiz collection.
 * This collection stores the 4 daily category-specific quizzes generated at midnight.
 * The entire questions are embedded here to ensure the daily quiz is self-contained.
 */
const dailyQuizSchema = new Schema(
  {
    category: {
      type: String,
      required: true,
      enum: ["general_knowledge", "tech", "aptitude", "maths"],
      unique: true, // Only one document per category for the current day
    },
    questions: [
      {
        question: String,
        options: [String],
        answer: Number,
        explanation: String,
        difficulty: Number,
        topic: String,
        concept: String,
      },
    ],
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index: MongoDB deletes the document when Date.now() >= expiresAt
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const DailyQuizModel = mongoose.model("DailyQuiz", dailyQuizSchema);
