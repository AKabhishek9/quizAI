import mongoose, { Schema, type InferSchemaType } from "mongoose";

const quizAttemptSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    stream: { type: String, required: true },
    topics: { type: [String], required: true },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    difficulty: { type: Number, required: true },
    answers: {
      type: [
        {
          questionId: { type: Schema.Types.ObjectId, ref: "Question", required: true },
          selectedOption: { type: Number, required: true },
          isCorrect: { type: Boolean, required: true },
        },
      ],
      default: [],
    },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  {
    versionKey: false,
    timestamps: false,
  }
);

// Compound index for dashboard queries: find({ userId }).sort({ createdAt: -1 })
quizAttemptSchema.index({ userId: 1, createdAt: -1 });

// We name it QuizAttempt inside ts, but collection is quiz_attempts
export type QuizAttemptDoc = InferSchemaType<typeof quizAttemptSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const QuizAttemptModel = mongoose.model("QuizAttempt", quizAttemptSchema);
