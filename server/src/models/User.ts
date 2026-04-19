import mongoose, { Schema, type InferSchemaType } from "mongoose";

/**
 * ConceptStat sub-document: tracks per-concept accuracy.
 * Stored as a Map for O(1) upserts.
 */
const conceptStatSchema = new Schema(
  {
    attempted: { type: Number, default: 0 },
    correct: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 }, // computed: correct / attempted
  },
  { _id: false }
);

/**
 * attemptedQuestions is capped at MAX_ATTEMPTED to prevent
 * unbounded growth. Old entries are shifted out (FIFO).
 */
export const MAX_ATTEMPTED = 500;

const userSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      default: "Student",
    },
    email: {
      type: String,
      trim: true,
      default: "",
    },
    attemptedQuestions: {
      type: [{ type: Schema.Types.ObjectId, ref: "Question" }],
      default: [],
    },
    conceptStats: {
      type: Map,
      of: conceptStatSchema,
      default: () => new Map(),
    },
    currentLevel: {
      type: Number,
      default: 1,
      min: 1,
      max: 5,
    },
    preferredStreams: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export type User = InferSchemaType<typeof userSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const UserModel = mongoose.model("User", userSchema);
