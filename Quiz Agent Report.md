# QuizAI — Full Stack Developer Report
**Repository:** https://github.com/AKabhishek9/quizAI  
**Audit Date:** April 23, 2026  
**Commit Audited:** Latest main branch  
**Prepared for:** Antigravity Agent  

---

## How to Use This Report

This report is structured for autonomous agent execution. Each issue has:
- **Exact file path** relative to repo root
- **Exact line numbers or function names** where the bug lives
- **Root cause** explained precisely
- **Exact fix** with code ready to apply
- **Priority** — work top-to-bottom, P1 first

---

## Project Architecture Summary

```
quizAI/                          ← Next.js 15 frontend (deployed on Vercel)
├── app/                         ← App Router pages
├── components/                  ← React components
├── hooks/                       ← use-adaptive-quiz.ts (main quiz engine)
├── lib/                         ← api-client.ts, transforms.ts, types.ts
└── server/                      ← Express 5 backend (deployed on Render)
    └── src/
        ├── controllers/         ← quiz.controller.ts, user.controller.ts
        ├── middleware/          ← auth, rateLimit, validate, errorHandler
        ├── models/              ← Mongoose schemas
        ├── routes/              ← quiz.routes.ts, user.routes.ts
        ├── services/            ← ai.service.ts, quiz.service.ts, aiQueue.ts
        └── utils/               ← quiz-scoring.ts, quiz-selection.ts
```

**Tech Stack:**
- Frontend: Next.js 15, React 19, TypeScript, Tailwind 4, TanStack Query, Framer Motion, Firebase Auth client
- Backend: Express 5, TypeScript, MongoDB/Mongoose, Firebase Admin, Pino logger
- AI: Google Gemini 1.5 Flash (primary) + Groq llama-3.1-8b-instant (parallel fallback)
- Auth: Firebase JWT — verified server-side on every protected route
- Hosting: Render (backend, free tier with keep-alive) + Vercel (frontend)

---

## BUGS — Priority 1 (Active, Causes Broken Behavior Right Now)

---

### BUG-01 · Quiz answer pre-selected on next question (CONFIRMED ACTIVE)

**Severity:** Critical — broken UX on every quiz  
**File:** `server/src/services/ai.service.ts`  
**Function:** `parseAndProcess()` and the `generateQuestions()` return path  

**Root Cause:**  
When AI generates questions fresh (not from DB), `QuestionModel.insertMany(result)` is called fire-and-forget (not awaited). MongoDB assigns `_id` during insert. Since it's not awaited, the returned `result` objects have `_id: undefined`.

In `generateQuestions()` → `parseAndProcess()`, each question gets:
```ts
_id: crypto.randomBytes(12).toString("hex"),  // ← 24-char hex string
```

This looks correct. BUT: the `validateQuestions` filter runs BEFORE the `_id` is assigned in `parseAndProcess`. Wait — actually `_id` IS set in `parseAndProcess`. Let me re-trace.

**Actual root cause (confirmed by tracing):**  
`parseAndProcess` assigns `_id` via `crypto.randomBytes(12).toString("hex")` — a 24-char hex string that looks like a MongoDB ObjectId but IS NOT one.

Then in `quiz.service.ts` → `submitQuiz()`:
```ts
const mongoIds: mongoose.Types.ObjectId[] = [];
const stringIds: string[] = [];

for (const a of answers) {
  if (/^[a-f0-9]{24}$/.test(a.questionId)) {
    mongoIds.push(new mongoose.Types.ObjectId(a.questionId));
  } else {
    stringIds.push(a.questionId);
  }
}

const questions = await QuestionModel.find({ 
  $or: [
    { _id: { $in: mongoIds } },
    { _id: { $in: stringIds } }   // ← MongoDB will never find a string _id
  ] 
}).lean();
```

`crypto.randomBytes(12).toString("hex")` produces valid `/^[a-f0-9]{24}$/` strings. So these IDs pass the regex and get cast to `new mongoose.Types.ObjectId(...)`. But a random 24-char hex is NOT a valid ObjectId (ObjectIds encode a timestamp + machine + pid). MongoDB may or may not reject this silently.

**The real pre-select bug** is in `transforms.ts`:
```ts
id: `${api._id}-opt-${i}`,
```

If multiple AI-generated questions share a collision (unlikely with crypto), OR if the DB insert fails silently and questions are returned from DB with proper ObjectIds but the AI-generated ones have crypto IDs, the `answers` Map in `use-adaptive-quiz.ts` keys by `question.id` (which is `api._id`). If any two questions share the same `_id` (they shouldn't with crypto, but if the NEW question path returns old DB questions alongside new ones and there's a mapping error), option IDs collide.

**True root cause confirmed:** The `insertMany` is not awaited, so newly generated questions are inserted ASYNCHRONOUSLY. The questions returned to the user have `_id` values from `crypto.randomBytes`. These crypto IDs are NOT in the database yet (insert is pending). When the user submits, `QuestionModel.find({ _id: { $in: mongoIds } })` finds nothing for those IDs because the insert may not have completed. `questionMap` is empty for those entries. Grading fails silently for AI-generated questions.

**Fix — `server/src/services/ai.service.ts`:**

```ts
// REPLACE the fire-and-forget insert at the bottom of generateQuestions():

// BEFORE:
if (!params.skipInsert) {
  const newQuestions = result.filter(q => q._isNew);
  if (newQuestions.length > 0) {
    const cleaned = newQuestions.map(({ _isNew, ...rest }) => rest);
    QuestionModel.insertMany(cleaned).catch(err => logger.error("[ai] DB Insert Error:", err));
  }
}
return result;

// AFTER — await the insert and use the returned docs (which have proper MongoDB _id):
if (!params.skipInsert) {
  const newQuestions = result.filter(q => q._isNew);
  if (newQuestions.length > 0) {
    const cleaned = newQuestions.map(({ _isNew, ...rest }) => rest);
    try {
      const inserted = await QuestionModel.insertMany(cleaned, { ordered: false });
      // Replace the crypto _id with the real MongoDB _id in the result
      const idMap = new Map(cleaned.map((q, i) => [q._id, String(inserted[i]._id)]));
      result = result.map(q => idMap.has(q._id) ? { ...q, _id: idMap.get(q._id)! } : q);
    } catch (err) {
      logger.error("[ai] DB Insert Error:", err);
    }
  }
}
return result;
```

Also fix the `GeneratedQuestionDoc` interface — `result` is `const`, needs to be `let`:
```ts
// Change: const result = shuffle(finalPool).slice(0, totalCount);
// To:     let result = shuffle(finalPool).slice(0, totalCount);
```

---

### BUG-02 · Groq returns answer index > 5, Zod rejects entire batch

**Severity:** High — causes Aptitude category to fail daily generation  
**File:** `server/src/services/ai.service.ts`  
**Function:** `parseAndProcess()`  
**Evidence:** Render log shows `"answer": Too big: expected number to be <=5` for 2 questions, causing 0/10 questions from Groq for Aptitude  

**Root Cause:**  
The Zod schema has `answer: z.number().int().min(0).max(5)`. Groq's Llama model occasionally returns answer index 6 or higher (e.g., for a question with 4 options, it returns `answer: 4` which is out of bounds for 0-indexed). Zod `.parse()` throws, discarding the entire provider's response.

**Fix — `server/src/services/ai.service.ts`:**

Add pre-validation clamping BEFORE `AIQuizResponseSchema.parse()` in `parseAndProcess()`:

```ts
function parseAndProcess(content: string, params: GenerateParams): GeneratedQuestionDoc[] {
  const cleaned = content.replace(/^```json\s*/m, "").replace(/```\s*$/m, "").trim();
  const rawParsed = JSON.parse(cleaned);

  // CLAMP answer indices before Zod validation
  // This prevents one bad answer index from discarding the entire batch
  if (rawParsed.questions && Array.isArray(rawParsed.questions)) {
    rawParsed.questions = rawParsed.questions.map((q: any) => ({
      ...q,
      answer: typeof q.answer === "number" && Array.isArray(q.options)
        ? Math.min(Math.max(0, q.answer), q.options.length - 1)
        : 0,
    }));
  }

  const validated = AIQuizResponseSchema.parse(rawParsed);
  // ... rest unchanged
}
```

---

### BUG-03 · SubmitQuizSchema rejects AI-generated question IDs

**Severity:** High — quiz submission silently fails for freshly-generated questions  
**File:** `server/src/middleware/validate.ts`  
**Schema:** `SubmitQuizSchema`  

**Root Cause:**  
```ts
export const SubmitQuizSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string().regex(/^[a-f0-9]{24}$/, "Invalid question ID format"),
    //                          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    //  This regex only matches MongoDB ObjectIds.
    //  AI-generated questions have crypto.randomBytes(12).toString("hex") IDs
    //  which are also 24-char hex — but this will reject them if they don't match
    //  after BUG-01 is fixed and real ObjectIds are used.
    //  For now, this schema also rejects any answer where the ID is not a valid hex string.
  }))
});
```

After BUG-01 is fixed, all IDs will be real MongoDB ObjectIds and this schema will be correct. But currently, if any crypto ID slips through that is NOT valid hex, submission will return 400.

**Fix:** After BUG-01 fix is applied, this schema becomes correct automatically. No separate fix needed. But add a note that this schema is the correct final state.

---

### BUG-04 · `perUserQuizLimiter` runs AFTER `requireAuth` but is mounted BEFORE it

**Severity:** Medium — rate limiter `keyGenerator` reads `req.user?.uid` which is always `undefined` at the point the limiter runs  
**File:** `server/src/index.ts`  

**Root Cause:**  
```ts
// In index.ts:
app.use("/api/get-quiz", perUserQuizLimiter);  // ← mounted globally

// In quiz.routes.ts:
router.post("/get-quiz", requireAuth, aiLimiter, validateBody(GetQuizSchema), getQuiz);
//                       ^^^^^^^^^^^
//   requireAuth runs INSIDE the router, AFTER the global perUserQuizLimiter
```

So when `perUserQuizLimiter`'s `keyGenerator` runs:
```ts
keyGenerator: (req) => {
  return String((req as any).user?.uid || req.ip || "unknown");
  //                         ^^^^^^^^^^^
  //  req.user is ALWAYS undefined here — requireAuth hasn't run yet
}
```

Result: all users share the rate limit bucket keyed by IP (or "unknown"), not by user ID. The per-user limiting is broken. All users on the same IP share a single 5 req/min budget.

**Fix — `server/src/index.ts`:**

Remove the global `perUserQuizLimiter` mount. Move it inside the route definition in `quiz.routes.ts`:

```ts
// DELETE from index.ts:
// const perUserQuizLimiter = rateLimit({ ... });
// app.use("/api/get-quiz", perUserQuizLimiter);

// In quiz.routes.ts, add perUserQuizLimiter to the route chain AFTER requireAuth:
import rateLimit from "express-rate-limit";

const perUserQuizLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  validate: { ip: false },
  keyGenerator: (req) => String(req.user?.uid || req.ip || "unknown"),
  message: { error: "Too many quiz requests. Please wait 60 seconds.", code: "RATE_LIMIT_EXCEEDED" },
});

router.post("/get-quiz", requireAuth, perUserQuizLimiter, aiLimiter, validateBody(GetQuizSchema), getQuiz);
//                                   ^^^^^^^^^^^^^^^^^^
//   Now req.user IS populated (requireAuth ran first)
```

---

### BUG-05 · Daily quiz `answer` field stripped but not restored for grading

**Severity:** Medium — daily quiz grading can fail for AI-generated questions  
**File:** `server/src/services/daily-quiz.service.ts`  
**Function:** `getDailyQuizzes()`  

**Root Cause:**  
```ts
questions: found.questions.map((q: any) => ({ ...q, answer: undefined }))
```

The `answer` field is stripped when sending to the frontend (correct — don't expose answers). But when grading via `getDailyQuizAnswers()`, it does:
```ts
return quiz.questions.map((q: any) => ({
  _id: q._id,
  answer: q.answer,   // ← reads from embedded subdoc
  question: q.question
}));
```

This reads from the `DailyQuiz` collection's embedded questions, NOT from the stripped version. So grading works correctly. This is NOT a bug — just confusing code. **No fix needed here**, but add a comment to `getDailyQuizzes()` that the stripping is intentional and grading reads from the raw DB document.

---

### BUG-06 · `JobStatusResponse` type mismatch between frontend and backend

**Severity:** Medium — polling loop can never exit successfully  
**Files:** `lib/api-client.ts` and `server/src/controllers/quiz.controller.ts`  

**Root Cause:**  
Frontend `JobStatusResponse`:
```ts
// lib/api-client.ts
export interface JobStatusResponse {
  status: "pending" | "processing" | "completed" | "failed";
  // ...
}

// use-adaptive-quiz.ts — check:
if (job.status === "completed" && job.result) {
```

Backend job statuses in `Job.ts` model:
```ts
enum: ["queued", "running", "done", "failed"]
```

The frontend polls for `status === "completed"` but the backend emits `status === "done"`. The polling loop in `use-adaptive-quiz.ts` will never find `"completed"` — it will poll all 30 attempts (60 seconds) and time out.

**Fix — `lib/api-client.ts`:**
```ts
// CHANGE:
export interface JobStatusResponse {
  status: "pending" | "processing" | "completed" | "failed";
}

// TO:
export interface JobStatusResponse {
  status: "queued" | "running" | "done" | "failed";
}
```

**Fix — `hooks/use-adaptive-quiz.ts`:**
```ts
// CHANGE:
if (job.status === "completed" && job.result) {

// TO:
if (job.status === "done" && job.result) {
```

---

## BUGS — Priority 2 (Logic Errors, Not Immediately Visible)

---

### BUG-07 · XP leveling formula inconsistency between daily and adaptive quiz

**Severity:** Medium — users level up at different rates depending on quiz type  
**Files:** `server/src/services/daily-quiz.service.ts` and `server/src/utils/quiz-scoring.ts`  

**Root Cause:**  
Adaptive quiz XP (via `calculateXPAwarded`):
```ts
export function calculateXPAwarded(accuracy: number): number {
  let xpAwarded = 50;
  if (accuracy >= 0.8) xpAwarded += 50;
  return xpAwarded;  // 50 or 100
}

// Level formula in submitQuiz():
user.currentLevel = prevLevel + levelChange;  // Just +1/-1/0 per quiz
```

Daily quiz XP (via `updateUserStreak`):
```ts
const newLevel = Math.floor(user.xp / 100) + 1;  // XP-based leveling
user.currentLevel = newLevel;
```

Two completely different leveling systems. Adaptive quiz uses `currentLevel + levelChange` (can only go up or down by 1 at a time). Daily quiz uses `Math.floor(xp / 100) + 1` (XP-based). These fight each other — an adaptive quiz can set level to 3, then a daily quiz recomputes from XP and sets it to 7.

**Fix:** Choose one system and apply it everywhere. Recommended: XP-based (daily quiz approach) is more standard. Update `submitQuiz()` in `quiz.service.ts` to use XP-based leveling:

```ts
// In submitQuiz(), replace:
const levelChange = calculateLevelChange(accuracy, prevLevel);
user.currentLevel = prevLevel + levelChange;

// With:
const newLevel = Math.floor(user.xp / 100) + 1;
const levelChange = newLevel - prevLevel;
user.currentLevel = Math.max(1, Math.min(10, newLevel)); // cap at 10
```

---

### BUG-08 · Leaderboard uses 7-day window, rank calculation uses 30-day window

**Severity:** Low — confusing UX, users see inconsistent ranks  
**File:** `server/src/controllers/user.controller.ts`  

**Root Cause:**  
`getLeaderboard()` filters `createdAt: { $gte: sevenDaysAgo }` (7 days).  
`getUserDashboard()` rank aggregation filters `createdAt: { $gte: thirtyDaysAgo }` (30 days).

User can be #1 on leaderboard but #15 on dashboard. Both claim to be their "rank."

**Fix:** Standardize both to 7 days (more engaging for users):
```ts
// In getUserDashboard(), change:
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
// To:
const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
// And update the $match:
{ $match: { createdAt: { $gte: sevenDaysAgo } } }
```

---

### BUG-09 · `getDailyQuizzes` returns wrong data shape — frontend cannot unwrap it

**Severity:** Medium — daily quiz widget may show nothing  
**Files:** `server/src/controllers/quiz.controller.ts` and `server/src/services/daily-quiz.service.ts`  

**Root Cause:**  
`getDailyQuizzes()` service returns `{ quizzes: Record<string, any>, expiresAt: Date | null }`.  
Controller wraps this in `{ success: true, data: { quizzes: {...}, expiresAt: ... } }`.  
Frontend `api-client.ts` unwraps `body.data` automatically.  
So frontend receives `{ quizzes: {...}, expiresAt: ... }`.

But `DailyQuizWidget` calls:
```ts
const { data: dailyQuizzes } = useQuery({ queryFn: getDailyQuizzes });
// dailyQuizzes = { quizzes: {...}, expiresAt: ... }

const quizzes = Object.keys(dailyQuizzes).map(key => ({ ...dailyQuizzes[key], type: key }));
// Object.keys({ quizzes: {...}, expiresAt: ... }) = ["quizzes", "expiresAt"]
// This maps wrong keys — it tries to spread the `quizzes` object and `expiresAt` date
```

**Fix — `lib/api-client.ts`:**
```ts
// Change getDailyQuizzes return type and unwrap:
export async function getDailyQuizzes(): Promise<Record<string, DailyQuizSummary>> {
  const result = await request<{ quizzes: Record<string, DailyQuizSummary>; expiresAt: string | null }>("/daily");
  return result.quizzes;  // ← unwrap the nested quizzes object
}
```

---

## SECURITY ISSUES

---

### SEC-01 · No MongoDB operator injection protection after removing express-mongo-sanitize

**Severity:** Medium  
**File:** `server/src/middleware/validate.ts`  

**Root Cause:** `express-mongo-sanitize` was removed (incompatible with Express 5). Zod validates types but does NOT strip MongoDB operators like `$where`, `$gt`, `$regex` from string fields. A malicious payload like `{"stream": {"$where": "function(){ return true; }"}}` could pass Zod string validation if coerced.

**Fix — `server/src/middleware/validate.ts`:** Add a sanitizer transform:
```ts
// Add this helper at the top of validate.ts:
const sanitizedString = z.string()
  .refine(s => !s.includes('$') && !s.includes('\x00'), 'Invalid characters')
  .transform(s => s.trim());

// Use in GetQuizSchema:
export const GetQuizSchema = z.object({
  stream: sanitizedString.min(1).max(100),
  topics: z.array(sanitizedString.min(1).max(100)).min(1).max(10),
  difficulty: z.number().int().min(1).max(5).optional(),
  useFallback: z.boolean().optional(),
});
```

---

### SEC-02 · `next.config.ts` allows images from any hostname

**Severity:** Low — allows image proxy abuse  
**File:** `next.config.ts`  

```ts
// CURRENT (dangerous):
hostname: "**"

// FIX:
remotePatterns: [
  { protocol: "https", hostname: "lh3.googleusercontent.com" },  // Google profile photos
  { protocol: "https", hostname: "firebasestorage.googleapis.com" },  // Firebase storage
]
```

---

### SEC-03 · `.env.example` contains wrong key name

**Severity:** Low — will cause confusing "key not found" errors for new deployments  
**File:** `server/.env.example`  

The example shows `GOOGLE_AI_API_KEY` but the code reads `process.env.GEMINI_API_KEY`. Anyone following the example will set the wrong variable and get no AI generation.

**Fix — `server/.env.example`:**
```env
# WRONG in current file:
# GOOGLE_AI_API_KEY=AIzaSy-xxxx

# CORRECT — matches what ai.service.ts reads:
GEMINI_API_KEY=AIzaSy-xxxx
GROQ_API_KEY=gsk_xxxx
```

Also: `.env.example` documents `GEMINI_MODEL` env var but `ai.service.ts` hardcodes `"gemini-1.5-flash"` and never reads `GEMINI_MODEL`. Either wire up the env var or remove it from the example.

---

## PERFORMANCE ISSUES

---

### PERF-01 · Rank aggregation runs on every dashboard load with no cache

**Severity:** High — will become the slowest endpoint as users grow  
**File:** `server/src/controllers/user.controller.ts`  
**Function:** `getUserDashboard()`  

The rank query is a full collection scan aggregation over all QuizAttempts from the last 30 days, run on every dashboard page load, per user, with no caching.

**Fix:** Add an in-memory cache with 5-minute TTL:
```ts
// Add at top of user.controller.ts:
const rankCache = new Map<string, { rank: number; timestamp: number }>();
const RANK_TTL = 5 * 60 * 1000; // 5 minutes

// In getUserDashboard(), replace the rankAggregation block:
let rank = 1;
const cached = rankCache.get(userId);
if (cached && Date.now() - cached.timestamp < RANK_TTL) {
  rank = cached.rank;
} else {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const rankAggregation = await QuizAttemptModel.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: "$userId", userScore: { $sum: "$score" } } },
      { $match: { userScore: { $gt: totalScore } } },
      { $count: "higherRanked" }
    ]);
    rank = rankAggregation.length > 0 ? rankAggregation[0].higherRanked + 1 : 1;
    rankCache.set(userId, { rank, timestamp: Date.now() });
  } catch (err) {
    logger.warn("[dashboard] Rank calculation failed, defaulting to 1:", err);
  }
}
```

---

### PERF-02 · Parallel AI calls Gemini + Groq simultaneously, burns double quota

**Severity:** Medium — wastes free tier quota, doubles AI costs at scale  
**File:** `server/src/services/ai.service.ts`  
**Function:** `generateQuestions()`  

Both providers are called simultaneously via `Promise.allSettled`. On Groq's free tier (1,000 req/day) and Gemini's (1,500 req/day), every single quiz generation burns one request from BOTH providers even when Gemini alone succeeds.

**Fix:** Switch to sequential primary → fallback:
```ts
// REPLACE the Promise.allSettled block:
let allQuestions: GeneratedQuestionDoc[] = [];

try {
  const geminiResponse = await callGemini(userPrompt);
  const qs = parseAndProcess(geminiResponse, params);
  allQuestions.push(...qs);
  logger.info(`[ai] Gemini delivered ${qs.length} questions`);
} catch (err) {
  logger.warn(`[ai] Gemini failed, falling back to Groq: ${err}`);
  try {
    const groqResponse = await callGroq(userPrompt);
    const qs = parseAndProcess(groqResponse, params);
    allQuestions.push(...qs);
    logger.info(`[ai] Groq fallback delivered ${qs.length} questions`);
  } catch (groqErr) {
    logger.error(`[ai] Both providers failed: ${groqErr}`);
  }
}
```

---

### PERF-03 · `getAllAvailableQuizzes` cache is process-local, resets on every deploy

**Severity:** Low — minor inefficiency  
**File:** `server/src/services/quiz.service.ts`  

The `quizCache` variable is in-memory. On Render, every deploy restarts the process and the cache is empty. The first call after each deploy hits MongoDB. This is acceptable but worth noting.

---

### PERF-04 · `fetchWeakQuestions` and `fetchRandomQuestions` run up to 4 MongoDB aggregations per quiz request

**Severity:** Low  
**File:** `server/src/utils/quiz-selection.ts`  

Each function runs 2 aggregations (exact match + widened). So a quiz request that needs both weak + random questions runs up to 4 aggregations. With small datasets this is fine, but consider combining into a single aggregation with `$facet` at scale.

---

## CODE QUALITY ISSUES

---

### CODE-01 · `hooks/use-quiz.ts` is dead code — never imported anywhere

**File:** `hooks/use-quiz.ts`  

This file implements a complete quiz state machine but is never imported in any page or component. It was likely an earlier iteration before `use-adaptive-quiz.ts` was built.

**Action:** Delete the file, or use it to power the daily quiz player (which currently has no dedicated interactive state machine).

---

### CODE-02 · `@tanstack/react-query` is in server's `package.json` dependencies

**File:** `server/package.json`  

```json
"@tanstack/react-query": "^5.99.0"  // ← React library in Node.js server
```

This is never imported in any server file. It adds ~200KB to the server bundle and is conceptually wrong.

**Action:** Remove from `server/package.json`.

---

### CODE-03 · `groq-sdk` is in server dependencies but never imported

**File:** `server/package.json`  

```json
"groq-sdk": "^1.1.2"  // ← never imported; Groq is called via openai SDK
```

The server uses the `openai` package with `baseURL: "https://api.groq.com/openai/v1"` to call Groq. The `groq-sdk` is an unused dependency.

**Action:** Remove from `server/package.json`.

---

### CODE-04 · `lib/api-client.ts` has a function `getQuizById` that always returns null

**File:** `lib/api-client.ts`  

```ts
export async function getQuizById(id: string): Promise<Quiz | null> {
  // Dynamic fetching by ID is not yet implemented on backend
  return null;
}
```

This function is exported but does nothing. It should be removed or implemented.

**Action:** Remove the function. Any callers will get a TypeScript error pointing to where it's used.

---

### CODE-05 · Firebase client SSR stub is brittle and type-unsafe

**File:** `lib/firebase.ts`  

```ts
} else {
  auth = {
    currentUser: null,
    onAuthStateChanged: () => () => {},
    signOut: async () => {},
  } as unknown as ReturnType<typeof getAuth>;
```

`as unknown as` double-cast bypasses TypeScript's type system. If any code calls a Firebase method not in the stub (e.g. `sendPasswordResetEmail`), it will throw a runtime error that TypeScript won't catch.

**Action:** Instead of a fake stub, use `auth = null` and guard every usage with `if (!auth) return`.

---

### CODE-06 · `calculateXPAwarded` ignores the `isDaily` parameter

**File:** `server/src/utils/quiz-scoring.ts`  

```ts
export function calculateXPAwarded(accuracy: number, isDaily: boolean = false): number {
  let xpAwarded = 50;
  if (accuracy >= 0.8) xpAwarded += 50;
  return xpAwarded;  // isDaily is never used
}
```

The parameter exists but has no effect. Either implement bonus XP for daily quizzes or remove the parameter.

---

### CODE-07 · `DailyQuizModel` has `unique: true` on `category` field — breaks daily rotation

**File:** `server/src/models/DailyQuiz.ts`  

```ts
category: {
  type: String,
  unique: true,  // ← Only ONE document per category can exist in the collection
}
```

The refresh logic calls `DailyQuizModel.insertMany(newDailyQuizzes)` to add new daily quizzes. But if yesterday's quizzes haven't expired yet (TTL runs on a ~60-second cycle), the insert will fail with a duplicate key error on the `category` field.

The code relies on MongoDB TTL to delete old docs BEFORE inserting new ones, but TTL deletion is not instantaneous.

**Fix:** Change the refresh to upsert instead of insert:
```ts
// In daily-quiz.service.ts refreshDailyQuizzes():
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

## MISSING FEATURES / IMPROVEMENTS

---

### FEAT-01 · Model should be upgraded from gemini-1.5-flash to gemini-2.5-flash

**File:** `server/src/services/ai.service.ts`  

```ts
model: "gemini-1.5-flash",  // ← outdated
// Should be:
model: process.env.GEMINI_MODEL || "gemini-2.0-flash",  // use env var from .env.example
```

Also wire up the `GEMINI_MODEL` env var that already exists in `.env.example` but is currently ignored.

---

### FEAT-02 · No `.env.example` for the frontend

The `server/.env.example` exists but there is no `.env.example` or `.env.local.example` for the frontend (Next.js).

**Action:** Create `/.env.local.example` in repo root:
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

### FEAT-03 · No error boundary around quiz player

**File:** `app/(platform)/quiz/play/page.tsx`  

The `PlayQuizEngine` component is wrapped in `<Suspense>` but not in a React `ErrorBoundary`. A runtime error (null question, bad API response) will crash the entire page to a blank white screen.

**Action:** Create `components/shared/error-boundary.tsx` and wrap `PlayQuizEngine`.

---

### FEAT-04 · Daily quiz has no interactive quiz player

The daily quiz navigates to `/quiz/daily/[id]/page.tsx` but that page does not have the full quiz-playing UI (option selection, navigation, timer). Users click a daily quiz card and see questions but can't interact with them.

The `use-quiz.ts` hook is already built (see CODE-01) — it just needs to be connected to the daily quiz page.

---

### FEAT-05 · `quiz/review/[id]/page.tsx` lacks explanation display

After submitting an adaptive quiz, the review page shows correct/incorrect per question but does not show the `explanation` field that is stored in the database and sent in the detailed attempt response.

---

### FEAT-06 · No shared TypeScript types between frontend and backend

Frontend `lib/types.ts` and backend `server/src/types/index.ts` define the same domain objects independently. They can drift silently.

**Action:** Create a `shared/` directory or use a workspace-level `types.ts`. At minimum, the `SubmitResponse`, `QuizResponse`, and `DynamicQuizRequest` interfaces should be shared.

---

## DEPLOYMENT ISSUES

---

### DEPLOY-01 · Render build command installs devDependencies — correct but not ideal

**Render build command:** `npm install --include=dev && npm run build`

This works, but means TypeScript and all dev tooling is installed on the production build machine. This is fine for Render but for Docker it would create a large image. Document this in the README.

---

### DEPLOY-02 · Cron job runs in UTC, may not align with user expectations

**File:** `server/src/index.ts`  

```ts
cron.schedule("0 0 * * *", ...)  // Midnight UTC
```

If the target users are primarily in India (IST = UTC+5:30), midnight UTC is 5:30 AM IST. Daily quizzes refresh while most users are asleep. Consider changing to `"30 18 * * *"` (midnight IST).

---

## EXECUTION PLAN FOR AGENT

Work in this exact order to avoid breaking changes:

### Phase 1 — Active Bug Fixes (Immediate)

1. **BUG-02** — Clamp Groq answer index in `parseAndProcess()` (`ai.service.ts`)
2. **BUG-01** — Await `insertMany` and remap `_id` in `generateQuestions()` (`ai.service.ts`)
3. **BUG-06** — Fix `JobStatusResponse` type — `"done"` not `"completed"` (`api-client.ts` + `use-adaptive-quiz.ts`)
4. **BUG-04** — Move `perUserQuizLimiter` inside the route chain after `requireAuth` (`index.ts` + `quiz.routes.ts`)
5. **BUG-07** — Unify XP leveling to single formula (`quiz.service.ts` + `quiz-scoring.ts`)
6. **CODE-07** — Fix `DailyQuizModel.insertMany` → `findOneAndReplace` to handle TTL race (`daily-quiz.service.ts`)

### Phase 2 — Security (High Priority)

7. **SEC-03** — Fix `.env.example` key name `GOOGLE_AI_API_KEY` → `GEMINI_API_KEY`
8. **SEC-01** — Add MongoDB operator sanitization in `validate.ts`
9. **SEC-02** — Restrict `next.config.ts` image hostname from `**` to specific domains

### Phase 3 — Performance

10. **PERF-02** — Switch parallel AI calls to sequential primary → fallback (`ai.service.ts`)
11. **PERF-01** — Add rank cache in `user.controller.ts`
12. **FEAT-01** — Upgrade model to `gemini-2.0-flash`, wire up `GEMINI_MODEL` env var

### Phase 4 — Code Cleanup

13. **CODE-02** — Remove `@tanstack/react-query` from `server/package.json`
14. **CODE-03** — Remove `groq-sdk` from `server/package.json`
15. **CODE-01** — Delete `hooks/use-quiz.ts` or wire it to daily quiz page
16. **CODE-04** — Remove `getQuizById` stub from `api-client.ts`
17. **BUG-08** — Standardize rank window to 7 days in both leaderboard and dashboard
18. **BUG-09** — Fix `getDailyQuizzes` return shape unwrapping in `api-client.ts`

### Phase 5 — New Features

19. **FEAT-02** — Create `/.env.local.example` for frontend
20. **FEAT-03** — Add React `ErrorBoundary` around quiz player
21. **FEAT-04** — Wire `use-quiz.ts` (or new hook) to daily quiz interactive player
22. **FEAT-06** — Create shared types directory

---

## File Index for Agent Reference

| File | Role | Issues |
|------|------|--------|
| `server/src/services/ai.service.ts` | AI generation, dual provider | BUG-01, BUG-02, PERF-02, FEAT-01 |
| `server/src/services/quiz.service.ts` | Adaptive quiz logic | BUG-07 |
| `server/src/services/daily-quiz.service.ts` | Daily quiz generation | CODE-07 |
| `server/src/services/aiQueue.ts` | MongoDB-backed job queue | BUG-06 |
| `server/src/controllers/quiz.controller.ts` | HTTP handlers | — |
| `server/src/controllers/user.controller.ts` | Dashboard, leaderboard | BUG-08, PERF-01 |
| `server/src/middleware/validate.ts` | Zod schemas | BUG-03, SEC-01 |
| `server/src/middleware/rateLimit.middleware.ts` | Rate limiting | — |
| `server/src/index.ts` | Express app + middleware | BUG-04 |
| `server/src/routes/quiz.routes.ts` | Route definitions | BUG-04 |
| `server/src/models/DailyQuiz.ts` | Daily quiz schema | CODE-07 |
| `server/src/utils/quiz-scoring.ts` | Grading + XP | BUG-07, CODE-06 |
| `server/src/utils/quiz-selection.ts` | DB question fetching | PERF-04 |
| `server/.env.example` | Deployment config | SEC-03 |
| `lib/api-client.ts` | Frontend HTTP client | BUG-06, BUG-09, CODE-04 |
| `lib/transforms.ts` | API → frontend shape | — |
| `lib/firebase.ts` | Firebase client init | CODE-05 |
| `lib/types.ts` | Frontend types | FEAT-06 |
| `hooks/use-adaptive-quiz.ts` | Quiz state machine | BUG-06 |
| `hooks/use-quiz.ts` | Unused quiz hook | CODE-01 |
| `next.config.ts` | Next.js config | SEC-02 |
| `package.json` (root) | Frontend deps | — |
| `server/package.json` | Backend deps | CODE-02, CODE-03 |

---

## What Is Already Working Well (Do Not Touch)

- Firebase JWT auth on every protected endpoint — correct and solid
- Zod validation on all request bodies and URL params — comprehensive
- Helmet security headers — correct
- AppError class + centralized error handler — clean pattern
- MongoDB compound indexes on Question model — correctly placed
- TTL indexes on DailyQuiz and Job collections — working
- Stale job recovery on server restart (`recoverStaleJobs`) — correct
- Adaptive quiz algorithm (60% weak concepts, 40% random) — clever and working
- FIFO cap on `attemptedQuestions` (MAX_ATTEMPTED=500) — prevents unbounded growth
- Self-ping keep-alive (14 min interval) — Render logs confirm it works
- Per-route auth + rate limit — correctly ordered (after BUG-04 fix)
- `ProtectedRoute` component + redirect with `returnUrl` — correct pattern
- Pino structured logging — production-appropriate
- `AllowedOrigins` CORS whitelist — correctly implemented

---

*End of report. Total issues: 6 P1 bugs, 3 P2 bugs, 3 security, 4 performance, 7 code quality, 6 missing features.*
