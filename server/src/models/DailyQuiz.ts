import mongoose, { Schema, type InferSchemaType } from "mongoose";

const dailyQuestionSchema = new Schema(
  {
    question: { type: String, required: true },
    options: { type: [String], required: true },
    answer: { type: Number, required: true },
    topic: { type: String, default: "General" },
    concept: { type: String, default: "General" },
  },
  { _id: true }
);

const dailyQuizSchema = new Schema(
  {
    category: {
      type: String,
      required: true,
      enum: ["Current Affairs", "Tech", "Maths", "Aptitude"],
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    questions: {
      type: [dailyQuestionSchema],
      required: true,
      validate: {
        validator: (v: any[]) => v.length === 10,
        message: "A daily quiz must have exactly 10 questions.",
      },
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Compound index to quickly find today's quizzes
dailyQuizSchema.index({ date: 1, category: 1 }, { unique: true });

export type DailyQuiz = InferSchemaType<typeof dailyQuizSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const DailyQuizModel = mongoose.model("DailyQuiz", dailyQuizSchema);
