# QuizAI — Full Stack Deep Dive Report
**Repository:** https://github.com/AKabhishek9/quizAI  
**Audit Date:** May 2, 2026  
**Branch:** main (latest commit)  
**Prepared by:** Claude Code Review Agent  

---

## Executive Summary

QuizAI is a well-structured full-stack adaptive quiz platform. The core architecture is sound — layered Express backend, adaptive selection algorithm, MongoDB persistence, Firebase auth, and a modern Next.js 15 frontend. Since the initial audit, meaningful fixes have been applied: the answer/explanation cross-check sanitizer, the Zod answer-index clamp, the daily quiz widget unwrapping, and the rate limiter validation flag.

**What remains** is a mix of active bugs causing user-facing problems right now, security gaps, architectural mismatches between frontend and backend, dead code, and a clear set of improvements that would take this from a student project to a production-quality application.

**Counts:** 5 active bugs · 4 security issues · 6 architectural problems · 8 improvements · 3 dead code items

---

## Table of Contents

1. [Stack Overview](#1-stack-overview)
2. [Active Bugs](#2-active-bugs)
3. [Security Issues](#3-security-issues)
4. [Architectural Problems](#4-architectural-problems)
5. [Code Quality](#5-code-quality)
6. [Improvements Needed](#6-improvements-needed)
7. [Dead Code](#7-dead-code)
8. [What Works Well](#8-what-works-well)
9. [Priority Execution Plan](#9-priority-execution-plan)

---

## 1. Stack Overview

```
Frontend (Vercel)                    Backend (Render)
─────────────────────                ──────────────────────────
Next.js 15 + React 19                Express.js 5 + Node.js 22
TypeScript                           TypeScript → compiled to dist/
Tailwind CSS 4                       MongoDB Atlas (M0 free)
TanStack Query v5                    Firebase Admin (JWT auth)
Framer Motion                        Pino logger
Firebase Auth SDK (client)           node-cron (midnight refresh)
shadcn/ui components                 Zod validation
                                     express-rate-limit v8

AI Providers
────────────────────────────────────
Primary:  Google Gemini 1.5 Flash (@google/generative-ai)
Fallback: Groq llama-3.1-8b-instant (via openai SDK with custom baseURL)
```

**Notable:** Despite the `.env.example` listing `GEMINI_MODEL` as a configurable env var, the code hardcodes `"gemini-1.5-flash"` in `callGemini()` and never reads `GEMINI_MODEL`. The newer, faster `gemini-2.0-flash` is available on the same free tier and is not being used.

---

## 2. Active Bugs

### BUG-01 · Job polling status mismatch — polling loop can never succeed
**Severity:** High  
**Files:** `lib/api-client.ts` · `hooks/use-adaptive-quiz.ts` · `server/src/models/Job.ts`

**Root Cause:**  
The Job model defines these statuses: `["queued", "running", "done", "failed"]`

But the frontend `JobStatusResponse` type and polling check use:
```ts
// api-client.ts
export interface JobStatusResponse {
  status: "pending" | "processing" | "completed" | "failed";
}

// use-adaptive-quiz.ts
if (job.status === "completed" && job.result) { ... }
```

`"completed"` is never emitted by the backend. The backend emits `"done"`. So if a quiz generation is ever queued (15s timeout path), the frontend will poll all 30 attempts (60 seconds) and then throw a timeout error — even if the job succeeded.

**Fix:**
```ts
// api-client.ts — fix the type:
export interface JobStatusResponse {
  status: "queued" | "running" | "done" | "failed";
  error?: string;
  result?: ApiQuestion[];
}

// use-adaptive-quiz.ts — fix the check:
if (job.status === "done" && job.result) {
```

---

### BUG-02 · `perUserQuizLimiter` runs before `requireAuth` — user-based key never set
**Severity:** Medium  
**Files:** `server/src/index.ts` · `server/src/routes/quiz.routes.ts`

**Root Cause:**  
```ts
// index.ts — mounted globally BEFORE the route
app.use("/api/get-quiz", perUserQuizLimiter);

// quiz.routes.ts — requireAuth runs INSIDE the router, AFTER the limiter
router.post("/get-quiz", requireAuth, aiLimiter, validateBody(...), getQuiz);
```

When `perUserQuizLimiter`'s `keyGenerator` runs, `requireAuth` has not executed yet, so `req.user` is always `undefined`. All users share a single rate-limit bucket keyed by IP (or `"unknown"`). Users on shared networks (college, office WiFi) will rate-limit each other.

**Fix:** Move `perUserQuizLimiter` inside the route definition, after `requireAuth`:
```ts
// Remove from index.ts entirely
// In quiz.routes.ts:
router.post("/get-quiz", requireAuth, perUserQuizLimiter, aiLimiter, validateBody(GetQuizSchema), getQuiz);
```

---

### BUG-03 · `DailyQuizModel` has `unique: true` on `category` — daily refresh fails silently
**Severity:** High  
**File:** `server/src/models/DailyQuiz.ts`

**Root Cause:**  
```ts
category: {
  type: String,
  unique: true,  // ← Only ONE document per category ever
}
```

The refresh service calls `DailyQuizModel.insertMany(newDailyQuizzes)` to add new daily quizzes. But if the old documents haven't been deleted yet by the TTL index (TTL runs on a ~60-second background cycle), the insert throws `E11000 duplicate key error` on the `category` field. The entire refresh silently fails because the error is caught by `try/catch` and logged only.

You can see this in practice: the Render logs show "Refresh cycle complete. Site is updated." — but this message is printed from the `finally` block regardless of whether quizzes were actually inserted.

**Fix:** Replace `insertMany` with upsert operations:
```ts
// In refreshDailyQuizzes():
// REPLACE:
await DailyQuizModel.insertMany(newDailyQuizzes);

// WITH:
for (const quiz of newDailyQuizzes) {
  await DailyQuizModel.findOneAndReplace(
    { category: quiz.category },
    quiz,
    { upsert: true, new: true }
  );
}
```

---

### BUG-04 · XP leveling uses two different systems — adaptive quiz and daily quiz fight each other
**Severity:** Medium  
**Files:** `server/src/utils/quiz-scoring.ts` · `server/src/services/daily-quiz.service.ts`

**Root Cause:**  
Adaptive quiz leveling (`quiz.service.ts → submitQuiz()`):
```ts
const levelChange = calculateLevelChange(accuracy, prevLevel);
user.currentLevel = prevLevel + levelChange; // +1 / 0 / -1 per quiz
```

Daily quiz leveling (`daily-quiz.service.ts → updateUserStreak()`):
```ts
const newLevel = Math.floor(user.xp / 100) + 1; // XP-based
user.currentLevel = newLevel;
```

These two systems fight each other. An adaptive quiz can set `currentLevel = 3` through incremental changes. Then a daily quiz submission recalculates from total XP and resets it to `7`. Or vice versa. The user's displayed level is non-deterministic depending on which quiz type they played last.

**Fix:** Pick one system (XP-based is more standard) and apply it everywhere:
```ts
// In quiz.service.ts submitQuiz():
const newLevel = Math.floor(user.xp / 100) + 1;
const levelChange = newLevel - prevLevel;
user.currentLevel = Math.max(1, newLevel);
```

---

### BUG-05 · `calculateXPAwarded` ignores its `isDaily` parameter
**Severity:** Low  
**File:** `server/src/utils/quiz-scoring.ts`

**Root Cause:**
```ts
export function calculateXPAwarded(accuracy: number, isDaily: boolean = false): number {
  let xpAwarded = 50;
  if (accuracy >= 0.8) xpAwarded += 50;
  return xpAwarded; // isDaily is never read
}
```

The `isDaily` parameter is declared but has no effect on the return value. Daily quizzes were presumably intended to award different XP (bonus for completing a daily challenge), but the implementation was never completed. This is not causing a crash but is misleading dead parameter code.

**Fix:** Either implement the bonus or remove the parameter:
```ts
export function calculateXPAwarded(accuracy: number, isDaily: boolean = false): number {
  let xpAwarded = 50;
  if (accuracy >= 0.8) xpAwarded += 50;
  if (isDaily) xpAwarded += 25; // Daily quest bonus
  return xpAwarded;
}
```

---

## 3. Security Issues

### SEC-01 · `.env.example` documents `GOOGLE_AI_API_KEY` but code reads `GEMINI_API_KEY`
**Severity:** High (causes silent deployment failures)  
**File:** `server/.env.example`

The example shows:
```env
GOOGLE_AI_API_KEY=AIzaSy-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

But `ai.service.ts` reads:
```ts
const apiKey = process.env.GEMINI_API_KEY?.trim();
if (!apiKey) throw new Error("GEMINI_API_KEY not found");
```

Anyone following the `.env.example` to deploy sets `GOOGLE_AI_API_KEY` — which is silently ignored. The server starts, all build checks pass, but every quiz generation fails with "GEMINI_API_KEY not found". This is the most common misconfiguration for new deployments.

Also: `GEMINI_MODEL` is documented in `.env.example` but never read by `callGemini()`, which hardcodes `"gemini-1.5-flash"`.

**Fix — `server/.env.example`:**
```env
# CORRECT key name (matches ai.service.ts):
GEMINI_API_KEY=AIzaSy-xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# This env var IS read in production (wire it up in ai.service.ts):
GEMINI_MODEL=gemini-2.0-flash
```

**Fix — `server/src/services/ai.service.ts`:**
```ts
const model = genAI.getGenerativeModel({
  model: process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash",
  ...
});
```

---

### SEC-02 · `next.config.ts` allows image proxy from any hostname
**Severity:** Medium  
**File:** `next.config.ts`

```ts
remotePatterns: [
  {
    protocol: "https",
    hostname: "**",   // ← Allows ANY URL to be proxied
  },
],
```

This allows Next.js's image optimizer to proxy images from any URL on the internet. An attacker could use your Vercel bandwidth to proxy content from arbitrary servers by constructing an `<Image src="https://malicious.com/whatever" />` URL that hits your Next.js app. For a project with Vercel's bandwidth limits this can cause unexpected overages.

**Fix:**
```ts
remotePatterns: [
  { protocol: "https", hostname: "lh3.googleusercontent.com" },   // Google profile photos
  { protocol: "https", hostname: "firebasestorage.googleapis.com" }, // Firebase storage
],
```

---

### SEC-03 · No MongoDB operator injection protection
**Severity:** Medium  
**File:** `server/src/middleware/validate.ts`

`express-mongo-sanitize` was correctly removed (it's incompatible with Express 5). But no replacement was added. Your Zod schemas validate types but do NOT strip MongoDB operators. A crafted payload like:

```json
{ "stream": { "$where": "function(){ sleep(10000); return true; }" } }
```

Would fail Zod's `z.string()` check since it's an object — but if any string field accepted user input directly into a MongoDB `$regex` or `$where` context it could be exploited.

Current schemas use `z.string().trim()` which is correct. The real risk is future developers adding new endpoints without sanitization.

**Fix — add a helper in `validate.ts`:**
```ts
// Add this helper and use it for all user-supplied string fields:
export const safeString = (min = 1, max = 100) =>
  z.string()
    .min(min)
    .max(max)
    .trim()
    .refine(s => !s.includes('$') && !s.includes('\x00'), {
      message: 'Invalid characters in input'
    });

// Update GetQuizSchema to use it:
export const GetQuizSchema = z.object({
  stream: safeString(1, 100),
  topics: z.array(safeString(1, 100)).min(1).max(10),
  ...
});
```

---

### SEC-04 · `perUserQuizLimiter` skip logic has path confusion
**Severity:** Low  
**File:** `server/src/index.ts`

```ts
const perUserQuizLimiter = rateLimit({
  ...
  skip: (req) => req.path !== "/api/get-quiz"  // ← Always skips
});
app.use("/api/get-quiz", perUserQuizLimiter);
```

When Express mounts `app.use("/api/get-quiz", ...)`, the path seen by the middleware is `/api/get-quiz`. But `req.path` inside middleware mounted this way is the **suffix** after the mount path — which is `""` or `/`. So `req.path !== "/api/get-quiz"` is always `true`, and the limiter always skips every request.

This means the per-user rate limiter currently does nothing. Every request is skipped.

**Fix:** Remove the `skip` function entirely. The `app.use("/api/get-quiz", ...)` mounting already ensures it only runs for that path:
```ts
const perUserQuizLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  validate: false,
  keyGenerator: (req) => String((req as any).user?.uid || req.ip || "unknown"),
  message: { error: "Too many quiz requests. Please wait 60 seconds.", code: "RATE_LIMIT_EXCEEDED" },
  // Remove the skip: line entirely
});
```

---

## 4. Architectural Problems

### ARCH-01 · Parallel AI calls burn double API quota on every generation
**Severity:** High  
**File:** `server/src/services/ai.service.ts`

```ts
const [geminiResult, openRouterResult] = await Promise.allSettled([
  callGemini(userPrompt),
  callOpenRouter(userPrompt)
]);
```

Both providers are called simultaneously on every single quiz generation — even when Gemini succeeds perfectly. On Gemini's free tier (1,500 req/day) and Groq's (1,000 req/day), every generation burns one from both providers. With 4 daily quiz categories × 1 cron run = 8 API calls for what could be 4.

**Fix:** Sequential primary → fallback:
```ts
let providerQuestions: GeneratedQuestionDoc[] = [];

try {
  const geminiResponse = await callGemini(userPrompt);
  providerQuestions = parseAndProcess(geminiResponse, params);
  logger.info(`[ai] Gemini delivered ${providerQuestions.length} questions`);
} catch (err) {
  logger.warn(`[ai] Gemini failed, falling back to Groq: ${err}`);
  try {
    const groqResponse = await callOpenRouter(userPrompt);
    providerQuestions = parseAndProcess(groqResponse, params);
  } catch (groqErr) {
    logger.error(`[ai] Both providers failed`);
  }
}
```

---

### ARCH-02 · Frontend `JobStatusResponse` type is disconnected from backend Job model
**Severity:** Medium  
**Files:** `lib/api-client.ts` · `server/src/models/Job.ts` · `server/src/types/index.ts`

Frontend and backend define the same domain objects independently with no shared types. The `JobStatusResponse` mismatch (BUG-01) is a direct consequence of this. Other types like `ApiQuestion`, `SubmitResponse`, and `DynamicQuizRequest` are duplicated between `lib/types.ts` (frontend) and `server/src/types/index.ts` (backend) and can silently drift.

**Fix:** Create a `shared/types.ts` at repo root:
```ts
// shared/types.ts
export interface JobStatus {
  status: "queued" | "running" | "done" | "failed";
  error?: string;
  result?: SharedQuestion[];
}

export interface SharedQuestion {
  _id: string;
  question: string;
  options: string[];
  topic: string;
  concept: string;
  difficulty: number;
}
```

Both `lib/api-client.ts` and `server/src/types/index.ts` import from this shared file.

---

### ARCH-03 · Rank aggregation runs on every dashboard load with no cache
**Severity:** Medium  
**File:** `server/src/controllers/user.controller.ts`

```ts
const rankAggregation = await QuizAttemptModel.aggregate([
  { $match: { createdAt: { $gte: thirtyDaysAgo } } },
  { $group: { _id: "$userId", userScore: { $sum: "$score" } } },
  { $match: { userScore: { $gt: totalScore } } },
  { $count: "higherRanked" }
]);
```

This full collection scan runs on every single dashboard page load for every user. As the user base grows this becomes the bottleneck of the entire application. The query also uses a 30-day window while the leaderboard uses 7 days — causing the inconsistency discussed in BUG-04 of the previous report.

**Fix:** Add a simple in-memory cache with TTL:
```ts
const rankCache = new Map<string, { rank: number; ts: number }>();
const RANK_TTL = 5 * 60 * 1000; // 5 minutes

async function getUserRank(userId: string, totalScore: number): Promise<number> {
  const cached = rankCache.get(userId);
  if (cached && Date.now() - cached.ts < RANK_TTL) return cached.rank;

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const agg = await QuizAttemptModel.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo } } },
    { $group: { _id: "$userId", s: { $sum: "$score" } } },
    { $match: { s: { $gt: totalScore } } },
    { $count: "n" }
  ]);
  const rank = agg[0]?.n + 1 || 1;
  rankCache.set(userId, { rank, ts: Date.now() });
  return rank;
}
```

---

### ARCH-04 · Daily quiz `getDailyQuizzes` returns wrong shape — `quizzes` key missing in some paths
**Severity:** Medium  
**Files:** `server/src/services/daily-quiz.service.ts` · `lib/api-client.ts`

The backend returns `{ quizzes: Record<string, any>, expiresAt: Date | null }` but there's a code path where categories with no matching quiz data are silently excluded from `result` (the `if (found)` branch). When all 4 categories fail to find data (first deployment, empty DB), the returned `result` object is `{}`. The frontend receives `{ quizzes: {}, expiresAt: null }` which correctly renders the empty state, but the background refresh is fired — and if the refresh fails silently due to BUG-03, users see an infinite spinner.

This was partially fixed by unwrapping `result.quizzes ?? {}` in `api-client.ts` but the root issue (BUG-03) means the refresh may never succeed.

---

### ARCH-05 · `submitQuiz` attempts to cast crypto hex IDs as MongoDB ObjectIds
**Severity:** Medium  
**File:** `server/src/services/quiz.service.ts`

```ts
for (const a of answers) {
  if (/^[a-f0-9]{24}$/.test(a.questionId)) {
    mongoIds.push(new mongoose.Types.ObjectId(a.questionId));  // ← Problem
  } else {
    stringIds.push(a.questionId);
  }
}
```

AI-generated questions get `_id` values from `crypto.randomBytes(12).toString("hex")` — which produces 24-char hex strings that PASS the `/^[a-f0-9]{24}$/` regex. So they get cast to `new mongoose.Types.ObjectId(...)`. But crypto random bytes do NOT produce valid ObjectIds (ObjectIds encode a 4-byte timestamp). MongoDB may accept or reject these, but even if accepted, the question lookup `QuestionModel.find({ _id: { $in: mongoIds } })` will fail to find them because the inserted document used a string `_id`, not an ObjectId.

This means AI-generated questions that haven't been DB-persisted yet (or whose async insert hasn't completed) cannot be graded. The `questionMap` is empty for these entries and `gradeQuizAnswers` silently marks them wrong.

**Fix:** Use proper MongoDB ObjectIds from the start:
```ts
// In parseAndProcess(), replace crypto ID generation:
import { Types } from "mongoose";

// Instead of:
_id: crypto.randomBytes(12).toString("hex"),

// Use:
_id: new Types.ObjectId().toString(),
```

This ensures all generated IDs are valid ObjectIds and the submission lookup works correctly.

---

### ARCH-06 · Leaderboard uses 7-day window, rank uses 30-day window
**Severity:** Low  
**File:** `server/src/controllers/user.controller.ts`

`getLeaderboard()` filters to `sevenDaysAgo`. `getUserDashboard()` rank calculation filters to `thirtyDaysAgo`. A user can be shown as rank #1 on the dashboard but not appear on the leaderboard at all if they played most quizzes outside the 7-day window.

**Fix:** Standardize both to 7 days. Change `thirtyDaysAgo` to `sevenDaysAgo` in the dashboard rank aggregation.

---

## 5. Code Quality

### QUALITY-01 · `@tanstack/react-query` is in server's `package.json` dependencies
**File:** `server/package.json`

```json
"@tanstack/react-query": "^5.99.0"
```

This is a React data-fetching library. It has no place on a Node.js Express server and is never imported in any server file. It adds unnecessary weight to the server's node_modules and is conceptually wrong.

**Fix:** Remove from `server/package.json` dependencies.

---

### QUALITY-02 · `groq-sdk` installed but never used
**File:** `server/package.json`

```json
"groq-sdk": "^1.1.2"
```

Groq is called via the `openai` package with a custom `baseURL`. The `groq-sdk` is never imported anywhere in the codebase.

**Fix:** Remove from `server/package.json`.

---

### QUALITY-03 · `callOpenRouter` function name is misleading
**File:** `server/src/services/ai.service.ts`

The function is named `callOpenRouter` but it actually calls either OpenRouter OR Groq depending on which environment variables are set. The naming implies it only calls OpenRouter but in production it's calling Groq. This creates confusion when reading logs like `"[ai] OpenRouter parse failed"` when the actual provider was Groq.

**Fix:** Rename to `callSecondaryProvider` and update the log messages accordingly.

---

### QUALITY-04 · Firebase client SSR stub is type-unsafe
**File:** `lib/firebase.ts`

```ts
} else {
  auth = {
    currentUser: null,
    onAuthStateChanged: () => () => {},
    signOut: async () => {},
  } as unknown as ReturnType<typeof getAuth>;
}
```

The `as unknown as` double-cast bypasses TypeScript completely. If any code calls a Firebase method not in the stub (like `sendPasswordResetEmail`, `updateProfile`, etc.), it throws a runtime error that TypeScript won't catch at compile time.

**Fix:** Export `auth` as `Auth | null` and use null-guards everywhere:
```ts
export const auth: Auth | null = typeof window !== "undefined" ? getAuth(app) : null;
```

---

### QUALITY-05 · `getQuizById` always returns null
**File:** `lib/api-client.ts`

```ts
export async function getQuizById(id: string): Promise<Quiz | null> {
  // Dynamic fetching by ID is not yet implemented on backend
  return null;
}
```

This function is exported but is hardcoded to return `null`. Any caller will always get null regardless of input. There's no corresponding backend endpoint. Should be removed or implemented.

---

## 6. Improvements Needed

### IMPROVE-01 · Upgrade Gemini model to 2.0 Flash and wire up `GEMINI_MODEL` env var
**File:** `server/src/services/ai.service.ts`

Current: `gemini-1.5-flash` (hardcoded, ignores `GEMINI_MODEL` env var)  
Should be: `gemini-2.0-flash` (faster, same free tier, better structured JSON output)

```ts
const model = genAI.getGenerativeModel({
  model: process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash",
  generationConfig: { responseMimeType: "application/json", temperature: 0.4 },
});
```

---

### IMPROVE-02 · Add `.env.local.example` for the frontend
**Location:** repo root

There is no `/.env.local.example` file documenting the required frontend environment variables. Anyone cloning the repo to run the frontend has no idea what `NEXT_PUBLIC_*` variables are needed.

**Create `/.env.local.example`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

---

### IMPROVE-03 · Add React Error Boundary around the quiz player
**File:** `app/(platform)/quiz/play/page.tsx`

The play page wraps `PlayQuizEngine` in `<Suspense>` but not in an Error Boundary. Any unhandled runtime error inside the quiz player (null question, bad API response, unexpected state) will crash the entire page to a white screen with no recovery UI.

**Fix:** Create `components/shared/error-boundary.tsx` and wrap `PlayQuizEngine`:
```tsx
<ErrorBoundary fallback={<QuizErrorState onRetry={...} />}>
  <PlayQuizEngine />
</ErrorBoundary>
```

---

### IMPROVE-04 · Daily quiz incorrect answer feedback shows wrong answer index
**File:** `app/(platform)/quiz/daily/[id]/page.tsx`

```ts
correctOptionId: q.answer.toString(),
```

The `correctOptionId` is set to the string of the answer index (e.g., `"2"`). But the option IDs generated by `useQuiz` are the option text values or numeric indices from the map. The matching check in `useQuiz` is:
```ts
if (answer === q.correctOptionId) { correct++; }
```

This will only match if `selectedAnswer === "2"` — but `selectedAnswer` is set from `optionId` which is `"0"`, `"1"`, `"2"`, `"3"` (the `optIdx.toString()`). This actually works because both are stringified indices. But it's fragile — if any refactor changes the ID format it silently breaks grading.

**Fix:** Document this assumption explicitly or use a type-safe approach:
```ts
correctOptionId: q.answer.toString(), // Safe: optIds in useQuiz are "0","1","2","3"
```

Add a comment to prevent future breakage.

---

### IMPROVE-05 · Daily quiz review page doesn't show explanation
**File:** `app/(platform)/quiz/review/[id]/page.tsx`

The review page shows questions with correct/incorrect marking but never displays the `explanation` field. The explanation is stored in the database, returned by `getQuizAttemptById`, and available in the `answer.question` object — it's just never rendered.

**Fix:** Add below each question's option list:
```tsx
{answer.question?.explanation && (
  <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
    <p className="text-xs font-semibold text-primary mb-1">Explanation</p>
    <p className="text-sm text-muted-foreground">{answer.question.explanation}</p>
  </div>
)}
```

---

### IMPROVE-06 · Cron job runs at midnight UTC, not midnight IST
**File:** `server/src/index.ts`

```ts
cron.schedule("0 0 * * *", ...); // Midnight UTC
```

If the primary user base is in India (IST = UTC+5:30), midnight UTC is 5:30 AM IST. Daily quizzes refresh while most users are asleep, which is fine — but if content is time-sensitive (e.g., "today's tech news"), UTC midnight generates content 5.5 hours before the Indian day starts. More importantly, some users may see "yesterday's" quiz still showing when they wake up if the TTL hasn't run yet.

**Consider:** `"30 18 * * *"` = midnight IST, or make this configurable via `CRON_SCHEDULE` env var.

---

### IMPROVE-07 · `fetchWeakQuestions` weak-concept threshold is 0.5, but docs say 0.7
**File:** `server/src/utils/quiz-selection.ts`

The `quiz.service.ts` docblock says:
```
Strategy: Identify weak concepts (accuracy < 0.5)
```

And indeed `quiz.service.ts` filters at `< 0.5`:
```ts
.filter(([, stat]) => stat.accuracy < 0.5)
```

But the agent report, README, and all documentation describe the threshold as **70% (0.7)**. The actual threshold of 50% means only concepts where users are getting fewer than half right are targeted as "weak". This is too low — a user getting 60% right on a concept is still weak but won't get targeted.

**Fix:** Raise the threshold to 0.7 to match the documented behavior:
```ts
.filter(([, stat]) => stat.accuracy < 0.7) // Match documented 70% threshold
```

---

### IMPROVE-08 · No keep-alive for Koyeb / non-Render hosting
**File:** `server/src/index.ts`

```ts
const RENDER_URL = process.env.RENDER_EXTERNAL_URL;
if (RENDER_URL) {
  // keep-alive logic only runs if RENDER_EXTERNAL_URL is set
}
```

The keep-alive ping is tied to `RENDER_EXTERNAL_URL` being set. If you migrate to Koyeb (which doesn't set this variable), the keep-alive stops. Use a more generic env var:

```ts
const BACKEND_URL = process.env.RENDER_EXTERNAL_URL || process.env.BACKEND_URL;
if (BACKEND_URL) {
  setInterval(async () => { ... }, 14 * 60 * 1000);
}
```

Then set `BACKEND_URL=https://your-app.koyeb.app` in your hosting env.

---

## 7. Dead Code

### DEAD-01 · `hooks/use-quiz.ts` — fully built, never imported anywhere
**File:** `hooks/use-quiz.ts`

This hook implements a complete quiz state machine: idle → playing → completed, answer tracking, feedback display, result scoring with weak-topic detection. It IS used by the daily quiz page (`daily/[id]/page.tsx` imports `useQuiz`). So it is not fully dead — it powers the daily quiz.

However, the adaptive quiz (`play/page.tsx`) uses `useAdaptiveQuiz` instead. The two hooks have overlapping but different APIs.

**Recommendation:** Keep `use-quiz.ts` for the daily quiz (it's already being used there). Document that `use-quiz.ts` = daily/synchronous quiz, `use-adaptive-quiz.ts` = AI-generated adaptive quiz.

---

### DEAD-02 · `lib/api-client.ts: getQuizById()` — always returns null
**File:** `lib/api-client.ts`

```ts
export async function getQuizById(id: string): Promise<Quiz | null> {
  return null; // Never implemented
}
```

This was previously used to fetch quiz library items by ID. The feature was never finished. No page calls this function.

**Action:** Delete the function. If it's needed later, implement it properly with a backend endpoint.

---

### DEAD-03 · `server/src/scripts/` — three utility scripts with no npm script link
**Files:** `server/src/scripts/seed.ts` · `server/src/scripts/verify-ai.ts` · `server/src/scripts/refresh-daily.ts`

`refresh-daily.ts` and `verify-ai.ts` have npm scripts (`daily-refresh`, `test-ai`). But `seed.ts` has no npm script entry. It exists as a standalone seeder with no documented way to run it.

**Action:** Either add `"seed": "tsx src/scripts/seed.ts"` to `server/package.json` or delete the file.

---

## 8. What Works Well

These areas are solid and should not be touched:

| Area | Assessment |
|---|---|
| Firebase JWT auth on every protected endpoint | Correct and complete |
| Zod validation on all request bodies and URL params | Comprehensive |
| AppError class + centralized error handler | Clean, consistent pattern |
| Answer/explanation cross-check sanitizer | New, well-implemented |
| Zod answer-index clamping | Correct fix for Groq's out-of-range indices |
| MongoDB compound indexes on Question model | Correctly placed for adaptive query |
| TTL indexes on DailyQuiz and Job collections | Working correctly |
| FIFO cap (500) on attemptedQuestions | Prevents unbounded growth |
| Stale job recovery on server restart | Correct and necessary |
| Helmet security headers | Production-appropriate |
| CORS whitelist (ALLOWED_ORIGINS) | Correctly implemented |
| API keys server-side only | Never exposed to client |
| `userId` always derived from JWT, never from body | Correct security practice |
| Self-ping keep-alive (14 min interval) | Confirmed working in Render logs |
| Keyboard navigation in quiz player (← →) | Nicely implemented |
| TanStack Query unified dashboard fetch | Eliminates triple-fetch problem |
| Idempotency check on quiz submission (10s window) | Prevents double-grading |

---

## 9. Priority Execution Plan

Work in this exact order:

### 🔴 P1 — Fix Now (Active Broken Behavior)

| # | Issue | File | Time |
|---|---|---|---|
| 1 | BUG-03: Replace `insertMany` with upsert in daily refresh | `daily-quiz.service.ts` | 10 min |
| 2 | BUG-01: Fix `JobStatusResponse` type — `"done"` not `"completed"` | `api-client.ts` + `use-adaptive-quiz.ts` | 5 min |
| 3 | SEC-01: Fix `.env.example` key name `GOOGLE_AI_API_KEY` → `GEMINI_API_KEY` | `.env.example` | 2 min |
| 4 | ARCH-05: Use proper MongoDB ObjectIds in `parseAndProcess()` | `ai.service.ts` | 15 min |
| 5 | IMPROVE-01: Wire up `GEMINI_MODEL` env var + upgrade to `gemini-2.0-flash` | `ai.service.ts` | 5 min |

### 🟡 P2 — Fix Soon (Security + Reliability)

| # | Issue | File | Time |
|---|---|---|---|
| 6 | BUG-02: Move `perUserQuizLimiter` after `requireAuth` | `index.ts` + `quiz.routes.ts` | 10 min |
| 7 | SEC-04: Remove broken `skip` function from `perUserQuizLimiter` | `index.ts` | 2 min |
| 8 | BUG-04: Unify XP leveling to single formula | `quiz.service.ts` + `quiz-scoring.ts` | 20 min |
| 9 | SEC-02: Restrict `next.config.ts` image hostname | `next.config.ts` | 2 min |
| 10 | ARCH-03: Add rank cache with 5-min TTL | `user.controller.ts` | 20 min |
| 11 | ARCH-06: Standardize rank window to 7 days | `user.controller.ts` | 3 min |

### 🟢 P3 — Improvements (Quality + Performance)

| # | Issue | File | Time |
|---|---|---|---|
| 12 | ARCH-01: Switch parallel AI to primary→fallback | `ai.service.ts` | 30 min |
| 13 | QUALITY-01: Remove `@tanstack/react-query` from server | `server/package.json` | 1 min |
| 14 | QUALITY-02: Remove `groq-sdk` from server | `server/package.json` | 1 min |
| 15 | IMPROVE-07: Raise weak-concept threshold to 0.7 | `quiz.service.ts` | 2 min |
| 16 | IMPROVE-05: Show explanation in review page | `quiz/review/[id]/page.tsx` | 15 min |
| 17 | IMPROVE-03: Add Error Boundary around quiz player | New component + `play/page.tsx` | 20 min |
| 18 | IMPROVE-02: Create `.env.local.example` for frontend | Repo root | 5 min |
| 19 | IMPROVE-08: Make keep-alive URL configurable | `index.ts` | 5 min |
| 20 | DEAD-02: Delete `getQuizById` stub | `api-client.ts` | 1 min |
| 21 | BUG-05: Implement `isDaily` XP bonus | `quiz-scoring.ts` | 5 min |

---

## File Reference Map

| File | Issues |
|---|---|
| `server/src/services/ai.service.ts` | BUG-05, ARCH-01, ARCH-05, IMPROVE-01, QUALITY-03 |
| `server/src/services/quiz.service.ts` | BUG-04, IMPROVE-07 |
| `server/src/services/daily-quiz.service.ts` | BUG-03, BUG-04 |
| `server/src/controllers/quiz.controller.ts` | — |
| `server/src/controllers/user.controller.ts` | ARCH-03, ARCH-06 |
| `server/src/index.ts` | BUG-02, SEC-04, IMPROVE-08 |
| `server/src/routes/quiz.routes.ts` | BUG-02 |
| `server/src/models/DailyQuiz.ts` | BUG-03 |
| `server/src/models/Job.ts` | BUG-01 |
| `server/src/utils/quiz-scoring.ts` | BUG-04, BUG-05 |
| `server/src/middleware/validate.ts` | SEC-03 |
| `server/.env.example` | SEC-01 |
| `server/package.json` | QUALITY-01, QUALITY-02 |
| `lib/api-client.ts` | BUG-01, DEAD-02, QUALITY-05 |
| `lib/firebase.ts` | QUALITY-04 |
| `hooks/use-adaptive-quiz.ts` | BUG-01 |
| `hooks/use-quiz.ts` | DEAD-01 |
| `app/(platform)/quiz/play/page.tsx` | IMPROVE-03 |
| `app/(platform)/quiz/review/[id]/page.tsx` | IMPROVE-05 |
| `app/(platform)/quiz/daily/[id]/page.tsx` | IMPROVE-04 |
| `next.config.ts` | SEC-02 |

---

*End of Report — Total: 5 bugs · 4 security · 6 architectural · 5 code quality · 8 improvements · 3 dead code items*
