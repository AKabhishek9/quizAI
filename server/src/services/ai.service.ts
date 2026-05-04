import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { QuestionModel } from "../models/Question.js";
import { z } from "zod";
import { logger } from "../utils/logger.js";
import { Types } from "mongoose";

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
  count?: number; // default 10
  isDaily?: boolean;
  expiresAt?: Date;
  skipInsert?: boolean;
}

export interface GeneratedQuestionDoc {
  _id: string;
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
  _isNew?: boolean;
}

// ── Providers ───────────────────────────────────────────────────────────────
async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("GEMINI_API_KEY not found");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash",
    generationConfig: { responseMimeType: "application/json", temperature: 0.4 },
  });

  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function callOpenRouter(prompt: string): Promise<string> {
  const groqKey = process.env.GROQ_API_KEY?.trim();
  const openRouterKey = process.env.OPENROUTER_API_KEY?.trim();
  
  // Explicitly prefer Groq as requested by user
  const useGroq = !!groqKey;
  const apiKey = useGroq ? groqKey : openRouterKey;

  if (!apiKey) throw new Error("AI API key (GROQ/OPENROUTER) not found");

  const baseURL = useGroq ? "https://api.groq.com/openai/v1" : "https://openrouter.ai/api/v1";
  
  // Use user-specified model or defaults
  const defaultModel = useGroq ? "llama-3.1-8b-instant" : "meta-llama/llama-3.3-70b-instruct:free";
  const model = process.env.AI_MODEL || defaultModel;

  const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: baseURL,
    defaultHeaders: { 
      "HTTP-Referer": "https://quizai.com", 
      "X-Title": "QuizAI" 
    }
  });

  const response = await openai.chat.completions.create({
    model: model,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4,
    response_format: { type: "json_object" },
  });

  return response.choices[0]?.message?.content ?? "";
}

// ── Helpers ─────────────────────────────────────────────────────────────────
async function fetchFallbackFromDB(params: GenerateParams, count: number, excludeIds: string[] = []): Promise<GeneratedQuestionDoc[]> {
  logger.info(`[ai] Fetching ${count} questions from DB fallback...`);

  const matchStage: any = {
    stream: params.stream,
    difficulty: { $gte: params.difficulty - 1, $lte: params.difficulty + 1 }, // Range for better matching
    _id: { $nin: excludeIds.map(id => {
      try { return new Types.ObjectId(id); } catch { return id; }
    }) }
  };

  if (params.topics && params.topics.length > 0) {
    matchStage.$or = params.topics.map(t => ({ 
      $or: [
        { topic: { $regex: new RegExp(t, 'i') } },
        { concept: { $regex: new RegExp(t, 'i') } }
      ]
    }));
  }

  const questions = await QuestionModel.aggregate([
    { $match: matchStage },
    { $sample: { size: count } }
  ]);

  return questions.map(q => ({
    ...q,
    _id: q._id.toString()
  })) as any;
}

// ── Main logic ──────────────────────────────────────────────────────────────
export async function generateQuestions(params: GenerateParams): Promise<GeneratedQuestionDoc[]> {
  const totalCount = params.count || 10;
  let finalPool: GeneratedQuestionDoc[] = [];

  // Step 1: ALWAYS try DB first, specifically for the selected topics
  try {
    const dbFallback = await fetchFallbackFromDB(params, totalCount, []);
    finalPool.push(...dbFallback);
    logger.info(`[ai] DB provided ${finalPool.length}/${totalCount} questions matching topics: ${params.topics.join(", ")}`);
  } catch (err) {
    logger.error(`[ai] DB fetch error: ${err}`);
  }

  // Step 2: If DB didn't have enough questions, ask AI to generate the exact remaining amount
  const neededCount = totalCount - finalPool.length;
  
  if (neededCount > 0) {
    const difficultyLabel =
      params.difficulty <= 1 ? "Easy (Level 1)"
        : params.difficulty <= 2 ? "Easy-Medium (Level 2)"
          : params.difficulty <= 3 ? "Medium (Level 3)"
            : params.difficulty <= 4 ? "Hard (Level 4)"
              : "Expert (Level 5)";

    const userPrompt = `You are an expert technical assessor generating high-quality multiple choice questions.
Your ONLY output must be valid JSON.

CRITICAL RULES:
- "answer" must be the 0-based index of the CORRECT option in the "options" array
- options[answer] MUST be the factually correct answer
- The explanation MUST describe why options[answer] is correct
- NEVER let the explanation name a different option than the one at index "answer"

Use this exact structure:
{
  "questions": [
    {
      "question": "A clear, unambiguous question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": 2,
      "explanation": "A concise explanation of why Option C (index 2) is correct.",
      "topic": "General topic",
      "concept": "Precise sub-topic"
    }
  ]
}

Generate exactly ${neededCount} multiple choice questions.
- Stream: ${params.stream}
- Difficulty: ${difficultyLabel}
- Topics: ${params.topics.join(", ")}
These questions MUST strictly belong to the specified Topics.`;

    logger.info(`[ai] DB gap found. Starting AI generation for remaining ${neededCount} Qs`);
    const startTime = Date.now();

    let aiQuestions: GeneratedQuestionDoc[] = [];

    try {
      const geminiResponse = await callGemini(userPrompt);
      aiQuestions = parseAndProcess(geminiResponse, params);
      logger.info(`[ai] Gemini delivered ${aiQuestions.length} questions`);
    } catch (err) {
      logger.warn(`[ai] Gemini failed, falling back to Groq: ${err}`);
      try {
        const secondaryResponse = await callOpenRouter(userPrompt);
        aiQuestions = parseAndProcess(secondaryResponse, params);
        logger.info(`[ai] Groq delivered ${aiQuestions.length} questions`);
      } catch (secondaryErr) {
        logger.error(`[ai] Both Gemini and Groq failed: ${secondaryErr}`);
      }
    }

    const elapsed = Date.now() - startTime;

    // Pipeline: Validate -> Deduplicate AI questions
    const validated = validateQuestions(aiQuestions);
    const newPool = deduplicateQuestions(validated);

    logger.info(`[ai] AI provided ${newPool.length}/${neededCount} valid unique questions in ${elapsed}ms`);

    // Add new questions to our final pool
    finalPool.push(...newPool);

    // Persist new AI questions to DB (background)
    if (!params.skipInsert) {
      const newToSave = newPool.filter(q => q._isNew);
      if (newToSave.length > 0) {
        const cleaned = newToSave.map(({ _isNew, ...rest }) => rest);
        QuestionModel.insertMany(cleaned).catch(err => logger.error("[ai] DB Insert Error:", err));
      }
    }
  }

  // Final shuffling and trimming
  const result = shuffle(finalPool).slice(0, totalCount);

  // If everything failed and we have 0 questions, throw the user-friendly error
  if (result.length === 0) {
    throw new Error("Unable to generate quiz for this topic at the moment. Please try again after some time.");
  }

  return result;
}

function parseAndProcess(content: string, params: GenerateParams): GeneratedQuestionDoc[] {
  // Step 1: Clean JSON fence
  const cleaned = content.replace(/^```json\s*/m, "").replace(/```\s*$/m, "").trim();
  const rawParsed = JSON.parse(cleaned);

  // Step 2: Clamp answer indices BEFORE Zod validation
  if (Array.isArray(rawParsed.questions)) {
    rawParsed.questions = rawParsed.questions.map((q: any) => ({
      ...q,
      answer: typeof q.answer === "number" && Array.isArray(q.options)
        ? Math.min(Math.max(0, q.answer), q.options.length - 1)
        : 0,
    }));
  }

  // Step 3: Zod schema validation
  const validated = AIQuizResponseSchema.parse(rawParsed);

  // Step 4: Sanitizer — cross-check answer index vs explanation
  const sanitized = validated.questions.filter((q) => {
    const markedOption = q.options[q.answer];
    if (!markedOption) return false;
    if (!q.explanation || q.explanation.trim().length < 5) return true;

    const explanationLower = q.explanation.toLowerCase();
    const markedLower = markedOption.toLowerCase();

    if (explanationLower.includes(markedLower)) return true;

    const contradictingIndex = q.options.findIndex((opt, i) => {
      if (i === q.answer) return false;
      const optLower = opt.toLowerCase();
      return optLower.length > 4 && explanationLower.includes(optLower);
    });

    if (contradictingIndex !== -1) {
      logger.warn(
        `[ai] Answer mismatch fixed: was ${q.answer} ("${markedOption}"), ` +
        `corrected to ${contradictingIndex} ("${q.options[contradictingIndex]}")`
      );
      (q as any).answer = contradictingIndex;
    }

    return true;
  });

  // Step 5: Map to GeneratedQuestionDoc
  return sanitized.map((q, idx) => ({
    _id: new Types.ObjectId().toString(),
    _isNew: true,
    question: q.question,
    options: q.options,
    answer: q.answer,
    explanation: q.explanation,
    stream: params.stream,
    subject: params.subject || "Mixed",
    topic:
      params.topics.find((t) =>
        q.topic?.toLowerCase().includes(t.toLowerCase())
      ) || params.topics[idx % params.topics.length],
    concept: q.topic || q.concept,
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
    const uniqueOptions = new Set(q.options.map(o => o.toLowerCase().trim()));
    return uniqueOptions.size === q.options.length;
  });
}

function deduplicateQuestions(questions: GeneratedQuestionDoc[]): GeneratedQuestionDoc[] {
  const seen = new Set<string>();
  const result: GeneratedQuestionDoc[] = [];
  const stopWords = new Set(["what", "is", "the", "a", "an", "of", "in", "on", "at", "to", "for", "with", "by", "from"]);

  for (const q of questions) {
    const normalized = q.question.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
    const contentWords = normalized.split(" ").filter(word => word.length > 2 && !stopWords.has(word)).sort().join(" ");

    if (!seen.has(contentWords)) {
      seen.add(contentWords);
      result.push(q);
    }
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
