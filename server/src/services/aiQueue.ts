import { logger } from "../utils/logger.js";
import type { GenerateParams } from "./ai.service.js";

type JobStatus = "queued" | "running" | "done" | "failed";

interface Job {
  id: string;
  key: string;
  params: GenerateParams;
  status: JobStatus;
  createdAt: number;
  updatedAt: number;
  error?: string;
}

const jobs = new Map<string, Job>();
const keyIndex = new Map<string, string>();
let processing = false;

function makeKey(p: GenerateParams) {
  return `${p.stream}::${(p.topics || []).join("|")}::${p.difficulty}::${p.count ?? 0}`;
}

export function addJob(params: GenerateParams) {
  const key = makeKey(params);
  const existing = keyIndex.get(key);
  if (existing) {
    const job = jobs.get(existing);
    if (job && (job.status === "queued" || job.status === "running")) {
      logger.info(`[aiQueue] Reusing existing job ${existing} for key ${key}`);
      return existing;
    }
  }

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const job: Job = {
    id,
    key,
    params,
    status: "queued",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  jobs.set(id, job);
  keyIndex.set(key, id);
  // Start processing asynchronously
  setImmediate(processQueue);
  logger.info(`[aiQueue] Job ${id} queued for key ${key}`);
  return id;
}

export function getJob(jobId: string) {
  return jobs.get(jobId) ?? null;
}

async function processQueue() {
  if (processing) return;
  processing = true;

  while (true) {
    const next = Array.from(jobs.values()).find((j) => j.status === "queued");
    if (!next) break;

    next.status = "running";
    next.updatedAt = Date.now();

    try {
      logger.info(`[aiQueue] Processing job ${next.id} ...`);
      const { generateQuestions } = await import("./ai.service.js");
      await generateQuestions(next.params);
      next.status = "done";
      next.updatedAt = Date.now();
      logger.info(`[aiQueue] Job ${next.id} done`);
    } catch (err) {
      next.status = "failed";
      next.error = String(err);
      next.updatedAt = Date.now();
      logger.error(`[aiQueue] Job ${next.id} failed: ${next.error}`);
    }
  }

  processing = false;
}

// Periodic cleanup for old jobs (keep last 24 hours)
setInterval(() => {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  for (const [id, job] of jobs.entries()) {
    if (job.updatedAt < cutoff) {
      jobs.delete(id);
      keyIndex.delete(job.key);
    }
  }
}, 60 * 60 * 1000);
