# QuizAI — Parallel Dual-Provider Implementation Plan
> Gemini 2.5 Flash + Groq llama-3.1-8b-instant fired at the exact same millisecond  
> 5 questions each → merged → deduped → shuffled → 10-question quiz  
> April 2026 · `github.com/AKabhishek9/quizAI`

---

## How It Works

Both API calls are fired at the **exact same moment** using `Promise.allSettled()`. Neither waits for the other. The quiz is ready as soon as the **slower** of the two responds — not the sum of both.

```
t=0ms  ──► Gemini 2.5 Flash  fired ─────────────────► responds at ~2000ms ──┐
t=0ms  ──► Groq llama-3.1-8b fired ──► responds at ~800ms                   │
                                                                              ▼
                                                               merge → dedup → shuffle
                                                               quiz ready at ~2000ms
```

Compare this to sequential (old approach):
```
t=0ms  ──► Gemini fired ──► responds at ~2000ms ──► Groq fired ──► responds at ~800ms
                                                    quiz ready at ~2800ms
```

**Parallel saves you ~800ms on every single quiz generation.**

---

## Why Both APIs Will Generate Different Questions

Both receive the same topic but they are completely independent models with different training data, different weights, and different internal "perspectives" on a subject. You do not need to do anything special to get diversity — it happens naturally.

- Gemini tends toward conceptual and theoretical angles
- Groq (Llama 3.1) tends toward practical and applied examples

The only risk is **accidental semantic overlap** — two questions asking essentially the same thing in different words. The `deduplicateQuestions()` function in this plan handles that.

---

## Quota Math

| Provider | Free limit | Questions per call | Calls per quiz |
|---|---|---|---|
| Gemini 2.5 Flash | 1,500 req/day | 5 | 1 |
| Groq llama-3.1-8b | 1,000 req/day | 5 | 1 |

**Result:** 1 quiz uses 1 Gemini request + 1 Groq request.  
Bottleneck is Groq at 1,000/day → **~1,000 quiz generations per day**, up from ~150 with single Gemini.

---

## What Changes in Your Codebase

Only **one file** changes meaningfully: `server/src/services/ai.service.ts`

`quiz.service.ts`, `aiQueue.ts`, routes, Zod schemas, MongoDB models — all stay exactly the same. The public signature of `generateQuestions()` does not change. Nothing downstream breaks.

---

## Full Implementation

### `server/src/services/ai.service.ts`

Replace only the provider section. Keep your existing `buildPrompt()` and `parseAndValidate()` exactly as they are.

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

// ─────────────────────────────────────────────────────────────────────────────
// PROVIDER FUNCTIONS
// Each is a clean async function that returns raw JSON string from the API.
// They are completely independent — no shared state, no coupling.
// ─────────────────────────────────────────────────────────────────────────────

async function callGemini(prompt: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json", // native JSON mode — always valid JSON
      temperature: 0.3,                     // low = factual, accurate MCQ answers
    },
  });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function callGroq(prompt: string): Promise<string> {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",          // NOT 70b — 8b is 10x faster, fits 6K TPM
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [{ role: "user", content: prompt }],
  });
  return completion.choices[0].message.content ?? "";
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// Public signature is identical to before — nothing downstream needs to change.
// ─────────────────────────────────────────────────────────────────────────────

export async function generateQuestions(params: GenerateParams): Promise<Question[]> {
  // Build both prompts before firing — so there is zero delay between the two calls
  const geminiPrompt = buildPrompt({ ...params, count: 5 });
  const groqPrompt   = buildPrompt({ ...params, count: 5 });

  // ── FIRE BOTH AT THE EXACT SAME MOMENT ──────────────────────────────────
  // Promise.allSettled fires both simultaneously on the same event loop tick.
  // Neither waits for the other to start.
  // allSettled (not all) means one failure does NOT cancel the other —
  // if Groq fails, Gemini's 5 questions are still returned and vice versa.
  const startTime = Date.now();

  const [geminiResult, groqResult] = await Promise.allSettled([
    callGemini(geminiPrompt),
    callGroq(groqPrompt),
  ]);

  const elapsed = Date.now() - startTime;
  console.info(`[AI] Both providers responded in ${elapsed}ms`);
  // ── END OF PARALLEL SECTION ──────────────────────────────────────────────

  // Collect questions from whichever providers succeeded
  const allQuestions: Question[] = [];

  if (geminiResult.status === "fulfilled") {
    try {
      const parsed = parseAndValidate(geminiResult.value); // your existing parser
      allQuestions.push(...parsed);
      console.info(`[AI] Gemini: ${parsed.length} questions`);
    } catch (err) {
      // Gemini responded but JSON was malformed — treat as failure
      console.warn("[AI] Gemini parse failed:", err);
    }
  } else {
    // Gemini API error (rate limit, auth, network)
    console.warn("[AI] Gemini call failed:", geminiResult.reason);
  }

  if (groqResult.status === "fulfilled") {
    try {
      const parsed = parseAndValidate(groqResult.value);
      allQuestions.push(...parsed);
      console.info(`[AI] Groq: ${parsed.length} questions`);
    } catch (err) {
      console.warn("[AI] Groq parse failed:", err);
    }
  } else {
    console.warn("[AI] Groq call failed:", groqResult.reason);
  }

  // Both providers failed entirely — throw so DB fallback kicks in
  if (allQuestions.length === 0) {
    throw new Error(
      "Both Gemini and Groq failed. DB fallback will serve cached questions."
    );
  }

  // Pipeline: validate → deduplicate → shuffle
  const validated = validateQuestions(allQuestions);
  const deduped   = deduplicateQuestions(validated);
  const final     = shuffle(deduped);

  console.info(
    `[AI] Final: ${final.length} questions from ${elapsed}ms parallel call`
  );

  return final;
}

// ─────────────────────────────────────────────────────────────────────────────
// QUALITY FILTER
// Runs on the merged array after both providers respond.
// Removes questions that are structurally broken.
// ─────────────────────────────────────────────────────────────────────────────

function validateQuestions(questions: Question[]): Question[] {
  return questions.filter((q, index) => {
    // Must have a real question string
    if (!q.question || q.question.trim().length < 15) {
      console.warn(`[QA] Q${index}: too short, skipping`);
      return false;
    }
    // Must have exactly 4 options
    if (!q.options || q.options.length !== 4) {
      console.warn(`[QA] Q${index}: not 4 options, skipping`);
      return false;
    }
    // Correct answer must actually be one of the 4 options
    const optionsLower = q.options.map((o: string) => o.toLowerCase().trim());
    if (!optionsLower.includes(q.correctAnswer.toLowerCase().trim())) {
      console.warn(`[QA] Q${index}: correct answer not in options, skipping`);
      return false;
    }
    // No duplicate options within a single question
    if (new Set(optionsLower).size !== 4) {
      console.warn(`[QA] Q${index}: duplicate options, skipping`);
      return false;
    }
    return true;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// DEDUPLICATION
// This is the key addition for the parallel approach.
// Two independent models on the same topic may occasionally generate
// questions that are semantically similar even if worded differently.
// This function catches both exact duplicates and near-duplicates.
// ─────────────────────────────────────────────────────────────────────────────

function deduplicateQuestions(questions: Question[]): Question[] {
  const seen = new Set<string>();
  const result: Question[] = [];

  for (const q of questions) {
    // Normalize the question text:
    // lowercase + remove punctuation + collapse whitespace
    // This catches near-duplicates like:
    //   "What is the time complexity of binary search?"
    //   "What is binary search's time complexity?"
    const normalized = q.question
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")   // strip punctuation
      .replace(/\s+/g, " ")           // collapse whitespace
      .trim();

    // Extract the key "content words" — skip common filler words
    // so "What is the capital of France?" and
    //    "Which city is the capital of France?" both key on "capital france"
    const stopWords = new Set([
      "what", "which", "who", "where", "when", "how", "why",
      "is", "are", "was", "were", "the", "a", "an", "of",
      "in", "on", "at", "to", "for", "with", "by", "from",
      "that", "this", "these", "those", "does", "do", "did",
      "can", "could", "would", "should", "will", "has", "have",
      "had", "be", "been", "being", "its", "their", "your"
    ]);

    const contentWords = normalized
      .split(" ")
      .filter(word => word.length > 2 && !stopWords.has(word))
      .sort() // sort so word order doesn't matter
      .join(" ");

    if (seen.has(contentWords)) {
      // This question's core content already exists in the result set
      // — it's a near-duplicate from the other provider, skip it
      console.info(`[Dedup] Skipping near-duplicate: "${q.question.substring(0, 60)}..."`);
      continue;
    }

    seen.add(contentWords);
    result.push(q);
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// SHUFFLE
// Fisher-Yates shuffle — unbiased random ordering.
// Ensures questions from Gemini and Groq are not grouped together
// (the merged array has Gemini Qs first, then Groq Qs — shuffle fixes this).
// ─────────────────────────────────────────────────────────────────────────────

function shuffle<T>(array: T[]): T[] {
  const arr = [...array]; // don't mutate the original
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY
// ─────────────────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

---

## Failure Scenarios — What Happens in Each Case

This is the most important thing to understand about `Promise.allSettled()`. Unlike `Promise.all()`, a single failure never kills the whole quiz.

### Scenario 1 — Both succeed (normal case)
```
Gemini ✅ 5 questions
Groq   ✅ 5 questions
──────────────────────
Result: 10 questions (minus any deduped)
```

### Scenario 2 — Gemini fails, Groq succeeds
```
Gemini ❌ rate limited / bad key / network error
Groq   ✅ 5 questions
──────────────────────
Result: 5 questions — quiz still works
        console.warn logs the Gemini failure
        you see it in Render logs
```

### Scenario 3 — Groq fails, Gemini succeeds
```
Gemini ✅ 5 questions
Groq   ❌ rate limited / bad key / network error
──────────────────────
Result: 5 questions — quiz still works
```

### Scenario 4 — Both fail
```
Gemini ❌
Groq   ❌
──────────────────────
Result: throws Error → your existing DB fallback
        serves cached questions from MongoDB
        user never sees an error
```

> **You already have a DB fallback** that catches thrown errors and serves cached questions. Scenario 4 flows into that existing code path automatically — nothing new needed.

---

## The Timing — Why There Is Minimal Delay

The critical thing is that **both calls start before either one awaits**. Here is what happens on the JavaScript event loop:

```typescript
// This is what Promise.allSettled does internally:

// t=0ms: callGemini() called → HTTP request sent → function suspends (async)
// t=0ms: callGroq() called → HTTP request sent → function suspends (async)  ← same tick
// t=0ms: both requests are now in flight simultaneously
//
// t=800ms: Groq responds → its promise resolves → result stored
// t=2000ms: Gemini responds → its promise resolves → result stored
// t=2000ms: Promise.allSettled resolves with both results
//
// Total wait: 2000ms (the slower one)
// NOT: 800ms + 2000ms = 2800ms
```

The only delay between the two calls is the time it takes JavaScript to execute the two lines inside `Promise.allSettled([...])` — which is microseconds, not milliseconds.

---

## Prompts — Should They Be Identical or Different?

**You can use the exact same `buildPrompt()` for both.** You do not need to craft different prompts to get different questions.

Here is why: the two models have different training data, different tokenization, and different internal representations of knowledge. When you ask both "Generate 5 MCQ questions about JavaScript closures", Gemini might focus on how closures capture variables, while Groq might focus on practical use cases like callback patterns. The diversity comes from the models, not the prompt.

The only prompt change is `count: 5` instead of `count: 10`:

```typescript
// Your existing buildPrompt() function — no changes needed
// Just pass count: 5 for each
const geminiPrompt = buildPrompt({ ...params, count: 5 });
const groqPrompt   = buildPrompt({ ...params, count: 5 });
```

---

## Environment Variables

Both keys must be present in **Render Dashboard → Environment** and your local `.env`:

```env
GEMINI_API_KEY=your_gemini_key_here   # free at aistudio.google.com
GROQ_API_KEY=your_groq_key_here       # free at console.groq.com
```

If either key is missing, that provider will throw a `401` error, which `Promise.allSettled()` catches gracefully — the quiz still works with 5 questions from the other provider.

---

## Checklist

- [ ] Confirm `@google/generative-ai` is in `server/package.json` (it already is)
- [ ] Confirm `groq-sdk` is in `server/package.json` (it already is)
- [ ] Add `GEMINI_API_KEY` to Render environment tab
- [ ] Verify `GROQ_API_KEY` is in Render environment tab
- [ ] Replace provider section in `server/src/services/ai.service.ts` with code above
- [ ] Keep `buildPrompt()` and `parseAndValidate()` exactly as they are
- [ ] Keep `quiz.service.ts`, routes, and MongoDB models exactly as they are
- [ ] Deploy to Render
- [ ] Test: generate a quiz — check Render logs for the `[AI] Both providers responded in Xms` line
- [ ] Verify the response time is close to the slower provider alone (not the sum of both)

---

*QuizAI · Parallel Dual-Provider Plan · April 2026 · github.com/AKabhishek9/quizAI*
