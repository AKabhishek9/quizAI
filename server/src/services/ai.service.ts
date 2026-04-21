import OpenAI from "openai";
import { QuestionModel } from "../models/Question.js";
import { z } from "zod";

// ── AI Client Configuration (OpenAI Compatible) ─────────────────────────────
let aiInstance: OpenAI | null = null;
let currentProvider: string | null = null;

function getAIClient(): OpenAI {
  const provider = (process.env.AI_PROVIDER || "groq").toLowerCase();
  
  // Re-initialize if provider changed or instance is missing
  if (!aiInstance || currentProvider !== provider) {
    let baseURL = "https://api.groq.com/openai/v1";
    let apiKey = process.env.GROQ_API_KEY?.trim() || "";

    if (provider === "openrouter") {
      baseURL = "https://openrouter.ai/api/v1";
      apiKey = process.env.OPENROUTER_API_KEY?.trim() || "";
    }

    aiInstance = new OpenAI({
      baseURL,
      apiKey,
      defaultHeaders: provider === "openrouter" ? {
        "HTTP-Referer": "https://github.com/AKabhishek9/quizAI",
        "X-Title": "QuizAI - Educational Platform",
      } : {},
    });
    currentProvider = provider;
  }
  return aiInstance;
}

// ── Zod schema for robust AI response validation ─────────────────────────────
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
  count?: number; // default 20
  isDaily?: boolean;
  expiresAt?: Date;
  skipInsert?: boolean;
}

export interface AIQuestion extends z.infer<typeof AIQuestionSchema> {}

// ── System prompt ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are an expert technical assessor generating high-quality multiple choice questions.
Your ONLY output must be valid JSON — no markdown, no explanation, no code fences.

Use this exact structure:
{
  "questions": [
    {
      "question": "A clear, unambiguous question text",
      "options": ["A", "B", "C", "D"],
      "answer": 2,
      "explanation": "A concise explanation of why the answer is correct and why others are wrong.",
      "topic": "General topic (e.g., Arrays)",
      "concept": "Precise sub-topic tested (e.g., Two Pointer Technique)"
    }
  ]
}

Difficulty scale (1–5):
- 1 (Easy):   Basic definitions, recall questions, simple direct concepts.
- 2:           Basic understanding/recognition of patterns.
- 3 (Medium): Applied understanding. Connecting concepts or practical problems.
- 4:           Multi-step reasoning, trade-offs, edge cases.
- 5 (Hard):   Advanced problem-solving or system design.

Rules:
1. Provide exactly the number of questions requested.
2. "answer" MUST be the 0-indexed integer of the correct option.
3. Adhere STRICTLY to the requested difficulty level.
4. Output ONLY the JSON object — no markdown fences.`;

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

// ── Main generation function ──────────────────────────────────────────────────
export async function generateQuestions(
  params: GenerateParams
): Promise<GeneratedQuestionDoc[]> {
  const provider = (process.env.AI_PROVIDER || "groq").toLowerCase();
  const apiKey = (provider === "openrouter" ? process.env.OPENROUTER_API_KEY : process.env.GROQ_API_KEY)?.trim() || "";
  
  if (!apiKey || apiKey.includes("your_key_here")) {
    throw new Error(`[ai] ${provider.toUpperCase()}_API_KEY is not set or still using placeholder.`);
  }

  const modelName = process.env.AI_MODEL?.trim() || (provider === "openrouter" ? "google/gemini-2.0-flash-lite-preview-001:free" : "llama-3.3-70b-versatile");
  const ai = getAIClient();
  const count = params.count || 20;

  const difficultyLabel =
    params.difficulty <= 1 ? "Easy (Level 1)"
    : params.difficulty <= 2 ? "Level 2"
    : params.difficulty <= 3 ? "Medium (Level 3)"
    : params.difficulty <= 4 ? "Hard (Level 4)"
    : "Expert (Level 5)";

  const userPrompt = `Generate ${count} multiple choice questions.
- Stream: ${params.stream}
- Difficulty: ${difficultyLabel}
- Topics: ${params.topics.join(", ")}`;

  let lastError: unknown = null;
  const MAX_ATTEMPTS = 2;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      console.log(`[ai] Attempt ${attempt}/${MAX_ATTEMPTS} | Model: ${modelName} | Topics: ${params.topics.join(", ")}`);

      const response = await ai.chat.completions.create({
        model: modelName,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        response_format: provider === "groq" ? { type: "json_object" } : undefined
      });

      let content = response.choices[0]?.message?.content || "";
      if (!content) throw new Error("Empty AI response");

      // Strip potential markdown fences if model ignored response_format
      content = content.replace(/^```json\s*/m, "").replace(/^```\s*/m, "").replace(/```\s*$/m, "").trim();

      const rawParsed = JSON.parse(content);
      const validated = AIQuizResponseSchema.parse(rawParsed);

      const documents = validated.questions.map((q, index) => {
        const matchedTopic = params.topics.find(t => t.toLowerCase() === q.topic.toLowerCase()) || params.topics[index % params.topics.length];

        return {
          question: q.question,
          options: q.options,
          answer: q.answer,
          explanation: q.explanation,
          stream: params.stream,
          subject: params.subject || "Mixed",
          topic: matchedTopic,
          concept: q.concept,
          difficulty: params.difficulty,
          isDaily: params.isDaily || false,
          expiresAt: params.expiresAt,
        };
      });

      if (documents.length > 0) {
        if (!params.skipInsert) {
          await QuestionModel.insertMany(documents);
          console.log(`[ai] Inserted ${documents.length} questions.`);
        }
        return documents;
      }

      throw new Error("AI returned 0 questions.");
    } catch (error) {
      lastError = error;
      console.error(`[ai] Attempt ${attempt} failed:`, error instanceof Error ? error.message : String(error));
      if (attempt < MAX_ATTEMPTS) await new Promise(r => setTimeout(r, 2000));
    }
  }

  // Final fallback: try database
  console.log("[ai] All generation attempts failed. Using cached DB fallback...");
  try {
    const fallback = await QuestionModel.find({
      stream: params.stream,
      difficulty: params.difficulty,
      topic: { $in: params.topics },
    }).limit(params.count || 20).lean();

    if (fallback.length > 0) return fallback as GeneratedQuestionDoc[];
  } catch (err) {
    console.error("[ai] DB fallback failed:", err);
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}
