import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { QuestionModel } from "../models/Question.js";
import { z } from "zod";
import { logger } from "../utils/logger.js";

// ── AI Response Validation Schemas ──────────────────────────────────────────
const AIQuestionSchema = z.object({
  question: z.string().min(5),
  options: z.array(z.string()).min(2).max(6),
  answer: z.number().int().min(0).max(5),
  explanation: z.string().min(10),
  topic: z.string().min(2),
  concept: z.string().min(2),
});

const AIQuizResponseSchema = z.object({
  questions: z.array(AIQuestionSchema).min(1),
});

export interface GenerateParams {
  stream: string;
  subject?: string;
  topics: string[];
  difficulty: number;
  count?: number; // default 10 (matches QUIZ_SIZE)
  isDaily?: boolean;
  expiresAt?: Date;
  skipInsert?: boolean;
}

export interface GeneratedQuestionDoc {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  stream: string;
  subject: string;
  topic: string;
  concept: string;
  difficulty: number;
  isDaily?: boolean;
  expiresAt?: Date;
}

// ── Provider Config ─────────────────────────────────────────────────────────
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── System prompt ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are an expert technical assessor generating high-quality multiple choice questions.
Your ONLY output must be valid JSON — no markdown, no explanation, no code fences.

Use this exact structure:
{
  "questions": [
    {
      "question": "A clear, unambiguous question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": 2,
      "explanation": "A concise explanation.",
      "topic": "General topic",
      "concept": "Precise sub-topic"
    }
  ]
}`;

// ── Gemini Provider ─────────────────────────────────────────────────────────
async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("GEMINI_API_KEY not found");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.3,
    },
  });

  const result = await model.generateContent(prompt);
  return result.response.text();
}

// ── Groq Provider ───────────────────────────────────────────────────────────
async function callGroq(prompt: string): Promise<string> {
  const apiKey = (process.env.GROQ_API_KEY || process.env.OPENROUTER_API_KEY)?.trim();
  if (!apiKey) throw new Error("Fallback API key (GROQ/OPENROUTER) not found");

  const isGroq = !!process.env.GROQ_API_KEY;
  const baseURL = isGroq ? "https://api.groq.com/openai/v1" : "https://openrouter.ai/api/v1";
  
  const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: baseURL,
    defaultHeaders: {
      "HTTP-Referer": "https://quizai.com",
      "X-Title": "QuizAI",
    }
  });

  const response = await openai.chat.completions.create({
    model: isGroq ? "llama-3.1-8b-instant" : "meta-llama/llama-3.1-8b-instruct:free",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    response_format: { type: "json_object" },
  });

  return response.choices[0]?.message?.content ?? "";
}

// ── Main generation function ────────────────────────────────────────────────
export async function generateQuestions(params: GenerateParams): Promise<GeneratedQuestionDoc[]> {
  const totalCount = params.count || 10;
  const countPerProvider = Math.ceil(totalCount / 2);
  
  const difficultyLabel =
    params.difficulty <= 1 ? "Easy (Level 1)"
    : params.difficulty <= 2 ? "Easy-Medium (Level 2)"
    : params.difficulty <= 3 ? "Medium (Level 3)"
    : params.difficulty <= 4 ? "Hard (Level 4)"
    : "Expert (Level 5)";

  const userPrompt = `${SYSTEM_PROMPT}

Generate ${countPerProvider} multiple choice questions.
- Stream: ${params.stream}
- Difficulty: ${difficultyLabel}
- Topics: ${params.topics.join(", ")}`;

  logger.info(`[ai] Starting parallel generation (${countPerProvider} Qs per provider)`);
  const startTime = Date.now();

  // Fire both simultaneously
  const [geminiResult, groqResult] = await Promise.allSettled([
    callGemini(userPrompt),
    callGroq(userPrompt)
  ]);

  const elapsed = Date.now() - startTime;
  logger.info(`[ai] Both providers responded in ${elapsed}ms`);

  let allQuestions: GeneratedQuestionDoc[] = [];

  // Process Gemini
  if (geminiResult.status === "fulfilled") {
    try {
      const qs = parseAndProcess(geminiResult.value, params);
      allQuestions.push(...qs);
      logger.info(`[ai] Gemini delivered ${qs.length} questions`);
    } catch (err) {
      logger.warn(`[ai] Gemini parse failed: ${err}`);
    }
  } else {
    logger.warn(`[ai] Gemini call failed: ${geminiResult.reason}`);
  }

  // Process Groq
  if (groqResult.status === "fulfilled") {
    try {
      const qs = parseAndProcess(groqResult.value, params);
      allQuestions.push(...qs);
      logger.info(`[ai] Groq delivered ${qs.length} questions`);
    } catch (err) {
      logger.warn(`[ai] Groq parse failed: ${err}`);
    }
  } else {
    logger.warn(`[ai] Groq call failed: ${groqResult.reason}`);
  }

  // If both failed or returned nothing, try DB fallback
  if (allQuestions.length === 0) {
    logger.error("[ai] Both providers failed. Using DB fallback.");
    const fallback = await QuestionModel.find({
      stream: params.stream,
      difficulty: params.difficulty,
      topic: { $in: params.topics },
    }).limit(totalCount).lean();

    if (fallback.length > 0) return fallback as any;
    throw new Error("Parallel AI generation failed and no cached questions found.");
  }

  // Pipeline: Validate -> Deduplicate -> Shuffle
  const validated = validateQuestions(allQuestions);
  const deduped = deduplicateQuestions(validated);
  const final = shuffle(deduped);

  // Trim to requested count if we have more than needed
  const result = final.slice(0, totalCount);

  logger.info(`[ai] Final: ${result.length} questions ready (${elapsed}ms)`);

  // Persist to DB if requested
  if (!params.skipInsert && result.length > 0) {
    QuestionModel.insertMany(result).catch(err => logger.error("[ai] DB Insert Error:", err));
  }

  return result;
}

function parseAndProcess(content: string, params: GenerateParams): GeneratedQuestionDoc[] {
  const cleaned = content.replace(/^```json\s*/m, "").replace(/```\s*$/m, "").trim();
  const rawParsed = JSON.parse(cleaned);
  const validated = AIQuizResponseSchema.parse(rawParsed);

  return validated.questions.map((q, idx) => ({
    question: q.question,
    options: q.options,
    answer: q.answer,
    explanation: q.explanation,
    stream: params.stream,
    subject: params.subject || "Mixed",
    topic: q.topic || params.topics[idx % params.topics.length],
    concept: q.concept,
    difficulty: params.difficulty,
    isDaily: params.isDaily || false,
    expiresAt: params.expiresAt,
  }));
}

function validateQuestions(questions: GeneratedQuestionDoc[]): GeneratedQuestionDoc[] {
  return questions.filter((q) => {
    if (!q.question || q.question.trim().length < 15) return false;
    if (!q.options || q.options.length < 2) return false;
    if (q.answer < 0 || q.answer >= q.options.length) return false;
    // Check for duplicate options
    const uniqueOptions = new Set(q.options.map(o => o.toLowerCase().trim()));
    if (uniqueOptions.size !== q.options.length) return false;
    return true;
  });
}

function deduplicateQuestions(questions: GeneratedQuestionDoc[]): GeneratedQuestionDoc[] {
  const seen = new Set<string>();
  const result: GeneratedQuestionDoc[] = [];

  const stopWords = new Set(["what", "is", "the", "a", "an", "of", "in", "on", "at", "to", "for", "with", "by", "from"]);

  for (const q of questions) {
    const normalized = q.question
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    const contentWords = normalized
      .split(" ")
      .filter(word => word.length > 2 && !stopWords.has(word))
      .sort()
      .join(" ");

    if (seen.has(contentWords)) {
      logger.info(`[ai] Dedup skipping: "${q.question.substring(0, 40)}..."`);
      continue;
    }

    seen.add(contentWords);
    result.push(q);
  }

  return result;
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
