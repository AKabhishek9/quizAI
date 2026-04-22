# QuizAI — Full Implementation Plan
> Project Audit · April 2026 · `github.com/AKabhishek9/quizAI`  
> Stack: Next.js · Express.js · MongoDB · Firebase · Groq/Gemini · Render (free tier)

---

## Table of Contents

1. [Project Architecture Summary](#1-project-architecture-summary)
2. [Issue Audit — All 8 Problems Found](#2-issue-audit--all-8-problems-found)
3. [Render Free Tier Strategy — The Cold Start Problem](#3-render-free-tier-strategy--the-cold-start-problem)
4. [AI Provider Decision](#4-ai-provider-decision)
5. [Phase 1 — Critical Fixes (Do These First)](#5-phase-1--critical-fixes-do-these-first)
6. [Phase 2 — Reliability Improvements](#6-phase-2--reliability-improvements)
7. [Phase 3 — Security Hardening](#7-phase-3--security-hardening)
8. [Phase 4 — Code Quality](#8-phase-4--code-quality)
9. [Phase 5 — Industry-Level Additions](#9-phase-5--industry-level-additions)
10. [Environment Variables Checklist](#10-environment-variables-checklist)
11. [Master Task Checklist](#11-master-task-checklist)

---

## 1. Project Architecture Summary

Your project is a full-stack adaptive quiz platform:

- **Frontend** — Next.js with Firebase Auth. The user logs in, picks a topic, and the frontend sends a request to the Express backend with a Firebase JWT token in the Authorization header.
- **Backend** — Express.js + TypeScript on port 5000. Every request is validated by Zod middleware. The backend checks MongoDB for cached questions first. Only when the question bank for a topic is empty does it make a live call to an AI provider.
- **Database** — MongoDB stores generated questions, user progress, adaptive quiz data (weak topics), and quiz history.
- **AI Layer** — `ai.service.ts` calls Groq (currently) or OpenRouter to generate MCQ questions in JSON format. Generated questions are stored permanently in MongoDB for reuse.
- **Queue** — `aiQueue.ts` manages background question generation jobs using a JavaScript `Map` (in-memory only — this is a known problem we fix in Phase 2).
- **Cron Job** — `daily-quiz.service.ts` runs at midnight to refresh 4 daily quiz categories.

**Key constants:**
- `QUIZ_SIZE = 10` — questions per quiz
- `MAX_ATTEMPTED = 500` — FIFO cap on attempted questions per user
- Adaptive selection: 60% from user's weak concepts, 40% random

**What's already well-built (don't touch these):**
- Zod validation on all endpoints ✅
- Firebase JWT auth on all protected routes ✅
- DB fallback when AI fails ✅
- Rate limiting: `aiLimiter` at 10 req/min ✅
- Adaptive quiz selection (60/40 split) ✅
- FIFO cap on `attemptedQuestions` ✅
- Server-side API key handling — keys never exposed to client ✅

---

## 2. Issue Audit — All 8 Problems Found

### 🔴 CRITICAL — Issue 1: Cold Start (The #1 Reason Quiz Fails)

**File:** `server/src/index.ts`

**What's happening:** Render's free tier spins the server down after 15 minutes of inactivity. When a user starts a quiz, the first request hits a sleeping server. Render takes 30–60 seconds to wake up. Even with a 90-second frontend timeout, nearly the entire budget is consumed by the wake-up, leaving almost no time for the AI call. This is why it sometimes works (when the server is warm) and fails other times.

**Fix:** Keep the server alive using UptimeRobot — a free external ping service that hits your `/api/health` endpoint every 10 minutes. This prevents Render from ever sleeping your server. Full implementation in [Phase 1, Fix 1](#fix-1-solve-the-render-cold-start-with-a-keep-alive-strategy).

---

### 🔴 CRITICAL — Issue 2: Wrong AI Model (70B is Too Heavy)

**File:** `server/src/services/ai.service.ts` (~line 55)

**What's happening:** Your default model is `llama-3.3-70b-versatile`. On Groq's free tier with a 6,000 tokens/minute limit, generating quiz questions with a 70B model consumes ~3,000–5,000 output tokens — nearly your entire per-minute budget in a single call. This is why requests timeout. The 70B model also takes far longer to respond than the 8B model.

**Fix:**
```diff
- "llama-3.3-70b-versatile"
+ "llama-3.1-8b-instant"
```

Switch primary to **Gemini 2.5 Flash** (1,500 req/day, no token/minute wall), keep Groq `llama-3.1-8b-instant` as fallback. Full implementation in [Phase 1, Fix 2](#fix-2-switch-primary-ai-provider-to-gemini-25-flash).

---

### 🔴 CRITICAL — Issue 3: API Keys Not Set on the Deployed Server

**What's happening:** You've been changing API keys in your local `.env` file. This has **zero effect** on the deployed backend. The server on Render reads environment variables only from the Render dashboard (Environment tab). Every time you changed providers locally, the deployed server kept using the old key — causing `401 Unauthorized` from the AI provider. Your error handler silently catches this and returns a timeout to the frontend.

**Fix:** Go to Render Dashboard → your service → Environment → add every key explicitly. This must be done every time you change a key or add a new one. List of all required env vars in [Section 10](#10-environment-variables-checklist).

---

### 🟡 WARNING — Issue 4: Generating 20 Questions When You Only Need 10

**File:** `server/src/services/quiz.service.ts`

**What's happening:** `QUIZ_SIZE = 10`, but both `generateQuestions()` calls use `count: 15`. You're requesting 50% more output than you need. This wastes tokens, makes each call slower, and burns through your free-tier daily quota faster than necessary.

**Fix:**
```diff
- count: 15,
+ count: 10,  // matches QUIZ_SIZE exactly
```
Apply to **both** calls in `quiz.service.ts`.

---

### 🟡 WARNING — Issue 5: Empty DB Blocks the Entire HTTP Response

**File:** `server/src/services/quiz.service.ts` (~line 85)

**What's happening:** When a user picks a topic that has never been quizzed before, the code falls into a synchronous generation path — the HTTP response hangs open and waits while the AI generates questions. If the AI call fails (rate limit, timeout, bad key), the user gets an error with no feedback. The background backfill path is well-designed. The sync path is the problem.

**Fix:** Wrap the synchronous AI call in a 15-second `Promise.race()` timeout. If it fires before the AI responds, immediately return HTTP 202 with a "generating" message and let the AI finish in the background. Full implementation in [Phase 2, Fix 5](#fix-5-add-timeout-guard-to-the-synchronous-generation-path).

---

### 🟡 WARNING — Issue 6: In-Memory Queue Lost on Every Server Restart

**File:** `server/src/services/aiQueue.ts`

**What's happening:** Your queue stores all jobs in a JavaScript `Map` in memory. When Render restarts the server (which happens on every deploy, crash, or memory limit hit), all queued generation jobs are silently lost. Users who triggered background backfills will get no new questions on their next session.

**Fix:** Replace the in-memory `Map` with a MongoDB-backed job queue using a `jobs` collection. Since MongoDB is already in your stack, this adds zero new dependencies. Full implementation in [Phase 2, Fix 6](#fix-6-replace-in-memory-queue-with-mongodb-backed-persistent-queue).

---

### 🟡 WARNING — Issue 7: "Current Affairs" Category Is Broken by Design

**File:** `server/src/services/daily-quiz.service.ts` → `CATEGORIES` array

**What's happening:** Your CATEGORIES config has a "Current Affairs" entry with prompt: *"focus strictly on news from today and yesterday, world events, and politics."* Groq's Llama models (and Gemini) have training cutoffs — they have no knowledge of yesterday's news. The AI generates plausible-sounding but fabricated or stale questions. This is a fundamental mismatch between feature intent and AI capability.

**Fix:**
```diff
- { id: "current_affairs", prompt: "focus strictly on news from today and yesterday..." }
+ { id: "general_knowledge", prompt: "focus on interesting general knowledge and trivia.",
+   topics: ["History", "Geography", "Science", "Nature", "World Records"] }
```

---

### 🔵 INFO — Issue 8: Temperature 0.7 Too High + No Exponential Backoff

**File:** `server/src/services/ai.service.ts`

**Two separate sub-issues:**

**8a — Temperature:** `temperature: 0.7` introduces creativity variance. Fine for writing, bad for factual MCQs. Higher temperature increases the chance the AI invents plausible-but-wrong answer choices or produces questions with debatable correct answers.
```diff
- temperature: 0.7,
+ temperature: 0.3,
```

**8b — Retry logic:** Your retry loop uses a fixed 2-second delay. If Groq returns `429 Rate Limited`, retrying after exactly 2 seconds will likely also fail. Additionally, the error is not inspected — if it's a `401 Bad Key`, retrying is pointless. Standard practice is exponential backoff: 2s → 4s → 8s, with error-type detection.

Full implementation in [Phase 1, Fix 3](#fix-3-fix-temperature-and-implement-exponential-backoff).

---

## 3. Render Free Tier Strategy — The Cold Start Problem

> **You said you're staying on Render. This section is critical.**

Render's free tier **sleeps your server after 15 minutes of inactivity**. You cannot disable this without paying $7/month for the "Starter" plan. However, you can work around it completely for free using an external keep-alive ping service.

### The Strategy: UptimeRobot (Free, Forever)

UptimeRobot is a free monitoring service that pings a URL on a schedule. If you ping your `/api/health` endpoint every **10 minutes**, Render never sees 15 minutes of inactivity and never sleeps your server.

**Setup (5 minutes, free):**

1. Go to [uptimerobot.com](https://uptimerobot.com) → Create free account
2. Click **"Add New Monitor"**
3. Set:
   - Monitor Type: `HTTP(s)`
   - Friendly Name: `QuizAI Backend`
   - URL: `https://your-render-url.onrender.com/api/health`
   - Monitoring Interval: `10 minutes`
4. Click **"Create Monitor"**

That's it. Your server now stays warm 24/7 at no cost.

### Add the `/api/health` Endpoint

You need a health endpoint for UptimeRobot to ping. Add this to your Express server:

**`server/src/index.ts`** (or your router file):
```typescript
// Add this route — no auth required, no DB call
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

> ⚠️ **Important:** This endpoint must be added **before** any auth middleware so UptimeRobot can hit it without a JWT token. Do not add `firebaseAuth` middleware to this route.

### What This Solves

- Server stays warm → No 30–60s cold start delay → Quiz generation has its full timeout budget
- Your cron job (midnight quiz refresh) will actually run reliably
- Zero cost

### What This Does NOT Solve

UptimeRobot keeps the server awake, but it does not make the server faster. The AI call still needs time. This is why switching to Gemini (Issue 2 fix) is equally important — Gemini has no tokens/minute wall on free tier, which removes the other major timeout cause.

---

## 4. AI Provider Decision

### Comparison Table

| Provider | Free Req/Day | Speed | JSON Mode | No Credit Card | Verdict |
|---|---|---|---|---|---|
| **Google AI Studio (Gemini 2.5 Flash)** | **1,500/day** | Fast | ✅ Native | ✅ | **USE — Primary** |
| Groq (llama-3.1-8b-instant) | 1,000/day | Fastest (315 tok/s) | ✅ | ✅ | Keep as Fallback |
| OpenRouter (free models) | ~20/day | Slow (queue) | Varies | ✅ | ❌ Avoid |
| Cloudflare AI | 10,000/day | Medium | ❌ No | ✅ | Emergency backup only |

### Why Gemini 2.5 Flash as Primary

- **1,500 requests/day** — at 10 questions per quiz, this is ~150 quiz generations/day free
- **No tokens/minute wall** — Groq's 6,000 TPM limit was the main cause of timeouts
- **Native JSON mode** — set `responseMimeType: "application/json"` and the response is always valid JSON, no regex parsing needed
- **`@google/generative-ai` is already in your `package.json`** — zero new installation needed
- **Free forever** — no credit card, no trial period

### Why Keep Groq as Fallback

- Already wired in your codebase
- 315 tokens/second — fastest inference available free
- Good fallback when Gemini hits its 15 RPM (requests per minute) limit
- With `llama-3.1-8b-instant` and `count: 10`, the 6K TPM limit is manageable as a fallback

### Get Your Gemini API Key

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Click **"Get API Key"** → **"Create API Key"**
3. Copy the key
4. Add to Render Environment: `GEMINI_API_KEY=your_key_here`
5. Add to your local `.env`: `GEMINI_API_KEY=your_key_here`

---

## 5. Phase 1 — Critical Fixes (Do These First)

> These three fixes are the minimum required to make the app reliably work. Do not move to Phase 2 until all three are done.

---

### Fix 1: Solve the Render Cold Start with a Keep-Alive Strategy

**Files to change:** `server/src/index.ts`

**Step 1:** Add the health endpoint to your Express server. Place it before any auth middleware:

```typescript
// server/src/index.ts
// Add this BEFORE app.use(firebaseAuth) or any protected middleware

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    env: process.env.NODE_ENV
  });
});
```

**Step 2:** Set up UptimeRobot as described in [Section 3](#3-render-free-tier-strategy--the-cold-start-problem).

**Step 3:** Verify your Render service's env vars are all set (see [Section 10](#10-environment-variables-checklist)). A missing key causes a silent 401 that looks like a timeout.

**Verification:** After deploying, wait 20 minutes (to let Render sleep), then hit your backend URL directly in a browser. It should respond in under 2 seconds because UptimeRobot will have been pinging it every 10 minutes.

---

### Fix 2: Switch Primary AI Provider to Gemini 2.5 Flash

**File:** `server/src/services/ai.service.ts`

**Step 1:** Install nothing — `@google/generative-ai` is already in your `package.json`.

**Step 2:** Rewrite the AI provider function. Here is the complete replacement pattern:

```typescript
// server/src/services/ai.service.ts

import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

const MAX_RETRIES = 3;

async function callGemini(prompt: string, count: number): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",  // Native JSON mode — always valid JSON
      temperature: 0.3,                       // Low temp for factual accuracy
    },
  });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function callGroq(prompt: string, count: number): Promise<string> {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",  // NOT 70b — 8b is 10x faster and fits TPM limit
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [{ role: "user", content: prompt }],
  });
  return completion.choices[0].message.content ?? "";
}

export async function generateQuestions(params: GenerateParams): Promise<Question[]> {
  const prompt = buildPrompt(params); // your existing prompt builder — unchanged

  // Try Gemini first
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const raw = await callGemini(prompt, params.count);
      return parseAndValidate(raw); // your existing parser — unchanged
    } catch (err: unknown) {
      const status = getHttpStatus(err);

      if (status === 401) {
        // Bad key — retrying is pointless
        console.error("Gemini auth failed — check GEMINI_API_KEY in Render environment");
        break; // fall through to Groq
      }

      if (attempt < MAX_RETRIES - 1) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500; // 2s → 4s → 8s + jitter
        await sleep(delay);
      }
    }
  }

  // Gemini failed — try Groq fallback
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const raw = await callGroq(prompt, params.count);
      return parseAndValidate(raw);
    } catch (err: unknown) {
      const status = getHttpStatus(err);

      if (status === 401) {
        throw new Error("Groq auth failed — check GROQ_API_KEY in Render environment");
      }

      if (attempt < MAX_RETRIES - 1) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
        await sleep(delay);
      }
    }
  }

  throw new Error("All AI providers failed after retries. DB fallback should handle this.");
}

// Helpers
function getHttpStatus(err: unknown): number | null {
  if (err && typeof err === 'object' && 'status' in err) return (err as any).status;
  if (err && typeof err === 'object' && 'statusCode' in err) return (err as any).statusCode;
  return null;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

> **Note:** Keep your existing `buildPrompt()` and `parseAndValidate()` functions exactly as they are. Only replace the provider section shown above.

**Step 3:** Add `GEMINI_API_KEY` to Render Environment (see [Section 10](#10-environment-variables-checklist)).

---

### Fix 3: Fix Temperature and Implement Exponential Backoff

> This is already handled in the code shown in Fix 2 above. But if you're not replacing the entire provider section yet, here are the two isolated changes:

**3a — Temperature (in `ai.service.ts`):**
```diff
- temperature: 0.7,
+ temperature: 0.3,
```

**3b — Exponential backoff pattern (replace your current fixed retry):**
```typescript
// BEFORE (fixed delay — bad):
await new Promise(r => setTimeout(r, 2000));

// AFTER (exponential backoff with jitter — correct):
const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
// attempt 0 → ~2000ms, attempt 1 → ~4000ms, attempt 2 → ~8000ms
await new Promise(r => setTimeout(r, delay));
```

**3c — Error type detection (add before the delay):**
```typescript
const status = getHttpStatus(err);
if (status === 401) {
  // Bad API key — do NOT retry, it will always fail
  throw new Error("Authentication failed. Check API keys in Render environment.");
}
if (status === 429) {
  // Rate limited — retry with backoff (this is the expected case)
  console.warn(`Rate limited on attempt ${attempt + 1}. Waiting ${delay}ms...`);
}
```

---

### Fix 4: Fix the Three Config Issues

**Files:** `quiz.service.ts`, `ai.service.ts`, `daily-quiz.service.ts`

**4a — Fix count mismatch** (`quiz.service.ts`):
```diff
// Find BOTH calls to generateQuestions() in quiz.service.ts
// Change count in each:
- count: 15,
+ count: 10,  // matches QUIZ_SIZE = 10
```

**4b — Fix the Groq model** (`ai.service.ts`):
```diff
- "llama-3.3-70b-versatile"
+ "llama-3.1-8b-instant"
```

**4c — Fix Current Affairs category** (`daily-quiz.service.ts`):
```diff
// In the CATEGORIES array:
- {
-   id: "current_affairs",
-   prompt: "focus strictly on news from today and yesterday, world events, and politics."
- }
+ {
+   id: "general_knowledge",
+   name: "General Knowledge",
+   prompt: "Generate questions on interesting general knowledge, trivia, history, geography, and science facts. Focus on well-established facts that have clear, unambiguous correct answers.",
+   topics: ["History", "Geography", "Science", "Nature", "World Records"]
+ }
```

> **Why:** LLMs have training cutoffs. They cannot know yesterday's news. The AI was generating plausible-sounding but fabricated "current affairs" questions. General Knowledge uses the same prompt structure but draws from facts the model actually knows reliably.

---

## 6. Phase 2 — Reliability Improvements

> Do these after Phase 1 is working and deployed.

---

### Fix 5: Add Timeout Guard to the Synchronous Generation Path

**File:** `server/src/services/quiz.service.ts` (~line 85)

**The problem:** When a topic has zero questions in the DB, the HTTP response hangs open while waiting for AI. If AI takes 20+ seconds or fails, the user gets a raw error.

**The fix:** Use `Promise.race()` to race the AI call against a 15-second timeout. If the timeout wins, return HTTP 202 immediately and let the AI finish in the background.

```typescript
// server/src/services/quiz.service.ts

const SYNC_TIMEOUT_MS = 15_000; // 15 seconds

async function generateWithTimeout(params: GenerateParams): Promise<Question[] | null> {
  const timeoutPromise = new Promise<null>((resolve) =>
    setTimeout(() => resolve(null), SYNC_TIMEOUT_MS)
  );

  const result = await Promise.race([
    generateQuestions(params),
    timeoutPromise
  ]);

  return result;
}

// In your quiz generation function, replace the synchronous path:
// BEFORE:
// const questions = await generateQuestions(params);
// return questions;

// AFTER:
const questions = await generateWithTimeout(params);

if (questions === null) {
  // Timeout fired — AI is still running in background
  // The background process will store results in MongoDB when done
  // so the user's NEXT request will find cached questions
  return res.status(202).json({
    status: 'generating',
    message: 'Quiz is being prepared. Please try again in 30 seconds.',
    retryAfter: 30
  });
}

// AI responded in time — store and return
await storeQuestions(questions, params.topic); // your existing storage logic
return res.status(200).json({ questions });
```

**Frontend update required:** Your Next.js frontend needs to handle the 202 response:

```typescript
// In your quiz-fetching function on the frontend:
const response = await fetch('/api/quiz/generate', { ... });

if (response.status === 202) {
  // Show user a friendly "preparing your quiz" screen
  // Auto-retry after 30 seconds
  setTimeout(() => fetchQuiz(), 30_000);
  return;
}

const data = await response.json();
// proceed normally
```

---

### Fix 6: Replace In-Memory Queue with MongoDB-Backed Persistent Queue

**File:** `server/src/services/aiQueue.ts`

**The problem:** Your current queue uses a JavaScript `Map`. When Render restarts the server (every deploy, crash, or Render maintenance), all queued jobs are silently lost. On free tier this happens frequently.

**Step 1:** Create a MongoDB model for jobs.

```typescript
// server/src/models/Job.model.ts (NEW FILE)
import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
  topic: string;
  difficulty?: string;
  status: 'pending' | 'processing' | 'done' | 'failed';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  retryCount: number;
}

const JobSchema = new Schema<IJob>({
  topic: { type: String, required: true },
  difficulty: { type: String },
  status: {
    type: String,
    enum: ['pending', 'processing', 'done', 'failed'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now },
  startedAt: { type: Date },
  completedAt: { type: Date },
  error: { type: String },
  retryCount: { type: Number, default: 0 }
});

// Auto-delete done jobs after 24 hours
JobSchema.index({ completedAt: 1 }, { expireAfterSeconds: 86400 });
// Index for efficient FIFO queue polling
JobSchema.index({ status: 1, createdAt: 1 });

export const Job = mongoose.model<IJob>('Job', JobSchema);
```

**Step 2:** Rewrite `aiQueue.ts` to use the `Job` model.

```typescript
// server/src/services/aiQueue.ts (REWRITTEN)
import { Job } from '../models/Job.model';

const MAX_CONCURRENT = 2; // same as before
let isProcessing = false;

// Call this on server startup to recover jobs that died mid-flight
export async function recoverStaleJobs(): Promise<void> {
  // Any job stuck in "processing" at startup = server crashed mid-job
  const stale = await Job.updateMany(
    { status: 'processing' },
    { $set: { status: 'pending', error: 'Recovered after server restart' } }
  );
  if (stale.modifiedCount > 0) {
    console.log(`[Queue] Recovered ${stale.modifiedCount} stale jobs`);
  }
}

export async function enqueueJob(topic: string, difficulty?: string): Promise<void> {
  // Check if a pending/processing job for this topic already exists
  const existing = await Job.findOne({
    topic,
    status: { $in: ['pending', 'processing'] }
  });

  if (existing) return; // Already queued — don't duplicate

  await Job.create({ topic, difficulty });
  processQueue(); // Kick off processing (non-blocking)
}

async function processQueue(): Promise<void> {
  if (isProcessing) return;
  isProcessing = true;

  try {
    while (true) {
      const processingCount = await Job.countDocuments({ status: 'processing' });
      if (processingCount >= MAX_CONCURRENT) break;

      // Pick the oldest pending job (FIFO)
      const job = await Job.findOneAndUpdate(
        { status: 'pending' },
        { $set: { status: 'processing', startedAt: new Date() } },
        { sort: { createdAt: 1 }, new: true }
      );

      if (!job) break; // No more pending jobs

      // Process in background — don't await
      processJob(job._id.toString()).catch(console.error);
    }
  } finally {
    isProcessing = false;
  }
}

async function processJob(jobId: string): Promise<void> {
  const job = await Job.findById(jobId);
  if (!job) return;

  try {
    const { generateQuestions } = await import('./ai.service');
    const questions = await generateQuestions({
      topic: job.topic,
      difficulty: job.difficulty,
      count: 10
    });

    await storeQuestions(questions, job.topic); // your existing storage

    await Job.findByIdAndUpdate(jobId, {
      status: 'done',
      completedAt: new Date()
    });
  } catch (err: unknown) {
    await Job.findByIdAndUpdate(jobId, {
      status: 'failed',
      error: err instanceof Error ? err.message : 'Unknown error',
      $inc: { retryCount: 1 }
    });
  }

  // Trigger next job in queue
  processQueue().catch(console.error);
}
```

**Step 3:** Call `recoverStaleJobs()` in your server startup:

```typescript
// server/src/index.ts
import { recoverStaleJobs } from './services/aiQueue';

// After MongoDB connects:
mongoose.connection.once('open', async () => {
  console.log('MongoDB connected');
  await recoverStaleJobs(); // Recover any jobs that died on last restart
});
```

---

## 7. Phase 3 — Security Hardening

> Your auth is already solid. These additions set standard HTTP security headers, prevent NoSQL injection, and add per-user rate limiting on top of the global limiter.

---

### Fix 7: Add Helmet, NoSQL Sanitization, and Per-User Rate Limiting

**File:** `server/src/index.ts`

**Step 1:** Install packages:
```bash
cd server
npm install helmet express-mongo-sanitize
```

**Step 2:** Wire them up in `index.ts` (order matters):

```typescript
// server/src/index.ts
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit'; // already installed

// Add these at the TOP of your middleware stack, before all routes:
app.use(helmet()); // Sets 15+ secure HTTP headers automatically

app.use(mongoSanitize()); // Strips $ and . from req.body, req.params, req.query
                           // Prevents NoSQL injection attacks

// Keep your existing global limiter — then add a per-user limiter on quiz routes:
const perUserQuizLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 quiz generations per user per minute
  keyGenerator: (req) => {
    // Use Firebase UID as the key (set by your JWT middleware in res.locals)
    return (req as any).user?.uid || req.ip;
  },
  message: {
    error: 'Too many quiz requests. Please wait 60 seconds.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

// Apply per-user limiter ONLY to quiz generation route:
app.use('/api/quiz/generate', perUserQuizLimiter);
```

> **Why these matter:**
> - `helmet()` prevents clickjacking, MIME sniffing, XSS, and a dozen other browser-level attacks. It's a one-liner that industry teams always include.
> - `express-mongo-sanitize` prevents a user from sending `{ "topic": { "$gt": "" } }` in the request body to bypass DB filters.
> - Per-user rate limiting prevents a single logged-in user from hammering the AI endpoint and exhausting your daily quota for everyone.

---

## 8. Phase 4 — Code Quality

> These changes make the codebase easier to maintain, debug, and demonstrate to others.

---

### Fix 8: Standardize All Error Responses

**Problem:** Different routes return errors in different formats. Some use `{ error: "..." }`, others use `{ message: "..." }`. This makes the frontend brittle — it has to handle multiple shapes.

**Fix:** Create a single `AppError` class and global error handler.

**Step 1:** Create `server/src/lib/AppError.ts`:
```typescript
// server/src/lib/AppError.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
```

**Step 2:** Add a global error handler at the bottom of `index.ts` (must be after all routes):
```typescript
// server/src/index.ts — add as the LAST middleware
import { ZodError } from 'zod';
import { AppError } from './lib/AppError';

app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Zod validation error
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: err.errors
    });
  }

  // Known application error
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code
    });
  }

  // Unknown error — log it, return generic message
  console.error('[Unhandled Error]', err);
  return res.status(500).json({
    success: false,
    error: 'Internal server error',
    code: 'INTERNAL_ERROR'
  });
});
```

**Step 3:** Replace scattered `res.status(xxx).json({ error: ... })` calls in route files with `next(new AppError(..., statusCode, 'ERROR_CODE'))`.

---

### Fix 9: Enable TypeScript Strict Mode

**File:** `server/tsconfig.json`

```diff
{
  "compilerOptions": {
+   "strict": true,
    // ... rest of your existing options
  }
}
```

After enabling, run `npx tsc --noEmit` to see all errors. Common patterns to fix:

```typescript
// Replace catch (e: any) with:
catch (e: unknown) {
  if (e instanceof Error) {
    console.error(e.message);
  }
}

// Add return types to exported functions:
export async function generateQuestions(params: GenerateParams): Promise<Question[]> { ... }

// Replace implicit any in parameters:
app.get('/health', (req: express.Request, res: express.Response) => { ... })
```

> Strict mode catches real bugs at compile time before they reach production. Every serious TypeScript project uses it.

---

### Fix 10: Add Question Quality Validation

**File:** `server/src/services/ai.service.ts`

After the AI responds and JSON is parsed, add a validation filter before storing or returning questions:

```typescript
// server/src/services/ai.service.ts

function validateQuestions(questions: Question[]): Question[] {
  const seen = new Set<string>();

  return questions.filter((q, index) => {
    // Rule 1: Question must be at least 15 characters
    if (q.question.trim().length < 15) {
      console.warn(`[QA] Question ${index} too short, skipping`);
      return false;
    }

    // Rule 2: Must have exactly 4 options
    if (!q.options || q.options.length !== 4) {
      console.warn(`[QA] Question ${index} doesn't have 4 options, skipping`);
      return false;
    }

    // Rule 3: Correct answer must be one of the 4 options
    const optionsLower = q.options.map((o: string) => o.toLowerCase().trim());
    if (!optionsLower.includes(q.correctAnswer.toLowerCase().trim())) {
      console.warn(`[QA] Question ${index} correct answer not in options, skipping`);
      return false;
    }

    // Rule 4: No duplicate options
    const uniqueOptions = new Set(optionsLower);
    if (uniqueOptions.size !== 4) {
      console.warn(`[QA] Question ${index} has duplicate options, skipping`);
      return false;
    }

    // Rule 5: No duplicate questions in this batch
    const key = q.question.toLowerCase().trim();
    if (seen.has(key)) {
      console.warn(`[QA] Duplicate question ${index}, skipping`);
      return false;
    }
    seen.add(key);

    return true; // Question is valid
  });
}

// In generateQuestions(), after parsing:
const allQuestions = parseAndValidate(raw);
const validQuestions = validateQuestions(allQuestions);

if (validQuestions.length === 0) {
  throw new Error('AI returned 0 valid questions after quality check');
}

if (validQuestions.length < 10) {
  console.warn(`[QA] Only ${validQuestions.length} valid questions out of ${allQuestions.length}`);
}

return validQuestions;
```

---

## 9. Phase 5 — Industry-Level Additions

> These additions are optional but make the project look and behave like a production product.

---

### Addition 1: GitHub Actions CI/CD Pipeline

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  typecheck:
    name: TypeScript Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: server/package-lock.json
      - name: Install dependencies
        run: cd server && npm ci
      - name: TypeScript strict check
        run: cd server && npx tsc --noEmit

  test:
    name: Tests
    runs-on: ubuntu-latest
    needs: typecheck
    env:
      NODE_ENV: test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: server/package-lock.json
      - name: Install dependencies
        run: cd server && npm ci
      - name: Run tests
        run: cd server && npm test
```

Add the CI badge to your `README.md`:
```markdown
![CI](https://github.com/AKabhishek9/quizAI/actions/workflows/ci.yml/badge.svg)
```

---

### Addition 2: Swagger API Documentation

**Installation:**
```bash
cd server
npm install swagger-jsdoc swagger-ui-express
npm install --save-dev @types/swagger-ui-express @types/swagger-jsdoc
```

**Create `server/src/lib/swagger.ts`:**
```typescript
import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'QuizAI API',
      version: '1.0.0',
      description: 'API documentation for the QuizAI adaptive quiz platform',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Firebase JWT token'
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./src/routes/*.ts'], // reads JSDoc comments from route files
};

export const swaggerSpec = swaggerJsdoc(options);
```

**Mount in `index.ts` (dev only):**
```typescript
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './lib/swagger';

if (process.env.NODE_ENV !== 'production') {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log('API docs available at /api/docs');
}
```

---

### Addition 3: Structured Logging with Pino

**Installation:**
```bash
cd server
npm install pino pino-pretty
npm install --save-dev @types/pino
```

**Create `server/src/lib/logger.ts`:**
```typescript
import pino from 'pino';

const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: process.env.NODE_ENV !== 'production'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
});

export default logger;
```

**Replace all `console.log` and `console.error` with the logger:**
```typescript
import logger from '../lib/logger';

// Instead of console.log:
logger.info({ topic, duration: elapsed, provider: 'gemini' }, 'Quiz generated');

// Instead of console.error:
logger.error({ err, attempt }, 'AI call failed');

// Instead of console.warn:
logger.warn({ count: validQuestions.length }, 'Below QUIZ_SIZE after QA filter');
```

> In production on Render, this outputs JSON logs that are searchable in the Render log viewer.

---

### Addition 4: Question Flagging Feature

Lets users report bad or wrong questions. This helps you audit AI quality over time.

**Create `server/src/models/Flag.model.ts`:**
```typescript
import mongoose, { Schema } from 'mongoose';
import crypto from 'crypto';

const FlagSchema = new Schema({
  questionId: { type: Schema.Types.ObjectId, required: true, ref: 'Question' },
  hashedUserId: { type: String, required: true }, // SHA-256 of Firebase UID — privacy
  reason: {
    type: String,
    enum: ['wrong_answer', 'bad_question', 'offensive', 'other'],
    required: true
  },
  comment: { type: String, maxlength: 500 },
  createdAt: { type: Date, default: Date.now }
});

// Prevent duplicate flags from the same user on the same question
FlagSchema.index({ questionId: 1, hashedUserId: 1 }, { unique: true });

export const Flag = mongoose.model('Flag', FlagSchema);

export function hashUserId(uid: string): string {
  return crypto.createHash('sha256').update(uid).digest('hex');
}
```

**Create `server/src/routes/flag.routes.ts`:**
```typescript
import { Router } from 'express';
import { z } from 'zod';
import { Flag, hashUserId } from '../models/Flag.model';
import { firebaseAuth } from '../middleware/firebaseAuth';
import { AppError } from '../lib/AppError';

const router = Router();

const flagSchema = z.object({
  reason: z.enum(['wrong_answer', 'bad_question', 'offensive', 'other']),
  comment: z.string().max(500).optional()
});

router.post('/questions/:questionId/flag', firebaseAuth, async (req, res, next) => {
  try {
    const body = flagSchema.parse(req.body);
    const hashedUserId = hashUserId((req as any).user.uid);

    await Flag.create({
      questionId: req.params.questionId,
      hashedUserId,
      reason: body.reason,
      comment: body.comment
    });

    res.status(200).json({ success: true, message: 'Thanks for the feedback.' });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as any).code === 11000) {
      return next(new AppError('You have already flagged this question.', 409, 'ALREADY_FLAGGED'));
    }
    next(err);
  }
});

export default router;
```

**Register in `index.ts`:**
```typescript
import flagRouter from './routes/flag.routes';
app.use('/api/quiz', flagRouter);
```

---

## 10. Environment Variables Checklist

> Every variable listed here must be added to **both** your local `.env` file AND your Render Dashboard → Environment tab.

```env
# AI Providers
GEMINI_API_KEY=your_gemini_key_here         # Get free: aistudio.google.com
GROQ_API_KEY=your_groq_key_here             # Get free: console.groq.com

# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/quizai

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# CORS
CORS_ORIGINS=https://your-nextjs-app.vercel.app,http://localhost:3000

# App
NODE_ENV=production
PORT=5000
```

### How to Update on Render

1. Go to [render.com](https://render.com) → Dashboard → your backend service
2. Click **"Environment"** in the left sidebar
3. Click **"Add Environment Variable"** for each key
4. Click **"Save Changes"** — Render will redeploy automatically

> ⚠️ **Every time you add or change a key, you must do it in the Render dashboard**. Changing your local `.env` file has zero effect on the deployed server.

---

## 11. Master Task Checklist

Use this as your working checklist. Complete in order — each phase builds on the previous.

### Phase 1 — Critical (App is broken without these)
- [ ] Add `/api/health` endpoint to `server/src/index.ts`
- [ ] Set up UptimeRobot — ping `/api/health` every 10 minutes
- [ ] Get Gemini API key from aistudio.google.com (free, no credit card)
- [ ] Add `GEMINI_API_KEY` to Render environment tab
- [ ] Add `GROQ_API_KEY` to Render environment tab (verify it's there)
- [ ] Add `GEMINI_API_KEY` to local `.env`
- [ ] Rewrite `ai.service.ts` — Gemini primary, Groq fallback
- [ ] Switch Groq model: `llama-3.3-70b-versatile` → `llama-3.1-8b-instant`
- [ ] Change temperature: `0.7` → `0.3` (both providers)
- [ ] Implement exponential backoff: `2s → 4s → 8s + jitter`
- [ ] Add error-type detection: skip retry on 401, retry on 429
- [ ] Fix count: `15` → `10` in both `generateQuestions()` calls in `quiz.service.ts`
- [ ] Replace `current_affairs` category with `general_knowledge` in `daily-quiz.service.ts`
- [ ] Deploy to Render → verify `/api/health` returns 200
- [ ] Test: start a quiz → should complete without timeout

### Phase 2 — Reliability
- [ ] Add `Promise.race()` timeout guard to sync generation path in `quiz.service.ts`
- [ ] Handle 202 response on the Next.js frontend (show "preparing" screen)
- [ ] Create `server/src/models/Job.model.ts` with MongoDB TTL index
- [ ] Rewrite `server/src/services/aiQueue.ts` to use MongoDB `jobs` collection
- [ ] Call `recoverStaleJobs()` on server startup in `index.ts`
- [ ] Test: kill and restart server → verify queued jobs survive

### Phase 3 — Security
- [ ] `npm install helmet express-mongo-sanitize` in server directory
- [ ] Add `app.use(helmet())` as first middleware in `index.ts`
- [ ] Add `app.use(mongoSanitize())` after helmet
- [ ] Add per-user rate limiter (5 req/min) on `/api/quiz/generate`
- [ ] Deploy and verify helmet headers in browser DevTools → Network tab

### Phase 4 — Code Quality
- [ ] Create `server/src/lib/AppError.ts`
- [ ] Add global error handler as last middleware in `index.ts`
- [ ] Replace scattered error responses in routes with `next(new AppError(...))`
- [ ] Enable `"strict": true` in `server/tsconfig.json`
- [ ] Run `npx tsc --noEmit` → fix all type errors (no `any` types)
- [ ] Add `validateQuestions()` function in `ai.service.ts`
- [ ] Wire quality filter after JSON parsing

### Phase 5 — Industry-Level
- [ ] Create `.github/workflows/ci.yml` (TypeScript check + tests on every push)
- [ ] Add CI badge to `README.md`
- [ ] `npm install swagger-jsdoc swagger-ui-express` in server directory
- [ ] Create `server/src/lib/swagger.ts` and mount at `/api/docs`
- [ ] `npm install pino pino-pretty` and create `server/src/lib/logger.ts`
- [ ] Replace all `console.log/error/warn` with Pino logger
- [ ] Create `Flag.model.ts` and `flag.routes.ts`
- [ ] Register flag router in `index.ts`
- [ ] Write a proper `README.md` with architecture diagram, setup steps, env var table

---

*QuizAI Project Audit · April 2026 · github.com/AKabhishek9/quizAI*
