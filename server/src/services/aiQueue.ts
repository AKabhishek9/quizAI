import { logger } from "../utils/logger.js";
import { JobModel } from "../models/Job.js";
import type { GenerateParams } from "./ai.service.js";

function makeKey(p: GenerateParams) {
  return `${p.stream}::${(p.topics || []).join("|")}::${p.difficulty}::${p.count ?? 0}`;
}

export async function addJob(params: GenerateParams) {
  const key = makeKey(params);
  
  // Check for active job with same parameters
  const existing = await JobModel.findOne({
    key,
    status: { $in: ["queued", "running"] }
  });

  if (existing) {
    logger.info(`[aiQueue] Reusing existing job ${existing._id} for key ${key}`);
    return String(existing._id);
  }

  const job = await JobModel.create({
    key,
    params,
    status: "queued"
  });

  // Start processing
  processQueue().catch(err => logger.error("[aiQueue] processQueue launch error:", err));
  
  logger.info(`[aiQueue] Job ${job._id} queued for key ${key}`);
  return String(job._id);
}

export async function getJob(jobId: string) {
  try {
    return await JobModel.findById(jobId).lean();
  } catch {
    return null;
  }
}

let processing = false;

async function processQueue() {
  if (processing) return;
  processing = true;

  try {
    while (true) {
      const next = await JobModel.findOneAndUpdate(
        { status: "queued" },
        { status: "running" },
        { new: true, sort: { createdAt: 1 } }
      );

      if (!next) break;

      try {
        logger.info(`[aiQueue] Processing job ${next._id} ...`);
        const { generateQuestions } = await import("./ai.service.js");
        const result = await generateQuestions(next.params as GenerateParams);
        
        await JobModel.findByIdAndUpdate(next._id, { 
          status: "done",
          result: result
        });
        logger.info(`[aiQueue] Job ${next._id} done`);

      } catch (err) {
        await JobModel.findByIdAndUpdate(next._id, { 
          status: "failed", 
          error: String(err) 
        });
        logger.error(`[aiQueue] Job ${next._id} failed: ${err}`);
      }
    }
  } finally {
    processing = false;
  }
}
export async function recoverStaleJobs() {
  try {
    const res = await JobModel.updateMany(
      { status: "running" },
      { status: "queued", error: "Recovered after server restart" }
    );
    if (res.modifiedCount > 0) {
      logger.info(`[aiQueue] Recovered ${res.modifiedCount} stale jobs`);
    }
  } catch (err) {
    logger.error({ err }, "[aiQueue] Error recovering stale jobs:");
  }
}

