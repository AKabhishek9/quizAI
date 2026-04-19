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
      enum: ["current_affairs", "tech", "aptitude", "maths"],
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
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const DailyQuizModel = mongoose.model("DailyQuiz", dailyQuizSchema);
