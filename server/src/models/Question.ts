import mongoose, { Schema, type InferSchemaType } from "mongoose";

const questionSchema = new Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length >= 2 && v.length <= 6,
        message: "Options must have 2–6 items",
      },
    },
    answer: {
      type: Number,
      required: true,
      min: 0,
    },
    stream: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    concept: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    difficulty: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/*
 * Compound index for the adaptive query:
 *   - Filter by difficulty
 *   - Filter by stream/topic
 *   - Exclude by _id
 */
questionSchema.index({ difficulty: 1, stream: 1, topic: 1 });
questionSchema.index({ difficulty: 1, concept: 1 });

export type Question = InferSchemaType<typeof questionSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const QuestionModel = mongoose.model("Question", questionSchema);
