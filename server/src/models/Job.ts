import mongoose, { Schema } from "mongoose";

const jobSchema = new Schema(
  {
    key: { type: String, required: true },
    status: {
      type: String,
      enum: ["queued", "running", "done", "failed"],
      default: "queued",
    },
    params: { type: Object, required: true },
    error: { type: String },
    result: { type: Array }, // Store generated questions here
  },
  {
    timestamps: true,
  }
);


// TTL index to automatically delete old jobs after 24 hours
jobSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

export const JobModel = mongoose.model("Job", jobSchema);
