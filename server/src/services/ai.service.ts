import OpenAI from "openai";
import { QuestionModel } from "../models/Question.js";
import { z } from "zod";

// ── OpenRouter API Configuration (Server-side only) ──────────────────────────
// The API key is read from OPENROUTER_API_KEY environment variable.
// It is NEVER shipped to the browser — this file only runs on the Express server.
let openaiInstance: OpenAI | null = null;

function getOpenAIClient() {
  if (!openaiInstance) {
    const key = process.env.OPENROUTER_API_KEY || "";
    openaiInstance = new OpenAI({
      apiKey: key,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "https://quizai.com",
      },
    });
  }
  return openaiInstance;
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
- 1 (Easy):   Basic definitions, recall questions, simple direct concepts. Suitable for beginners encountering the topic for the first time.
- 2:           Slightly beyond basics; requires light understanding or recognition of patterns.
- 3 (Medium): Applied understanding. Requires connecting concepts, writing/reading short code, or solving practical problems.
- 4:           Multi-step reasoning, edge cases, trade-offs between approaches.
- 5 (Hard):   Advanced problem-solving, system design implications, subtle gotchas, or algorithmic optimization.

Rules:
1. Provide exactly the number of questions requested.
2. "answer" MUST be the 0-indexed integer of the correct option in the options array.
3. Adhere STRICTLY to the requested difficulty level — do not mix levels unless explicitly asked.
4. Distribute questions evenly across the provided topics.
5. Options must be distinct, plausible, and only one unarguably correct.
6. Output ONLY the JSON object — absolutely no markdown, no \`\`\`json, no surrounding text.
7. All questions must be unique — do NOT reuse common textbook examples.`;

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

// ── Main generation function with OpenRouter + Fallback logic ────────────────
export async function generateQuestions(
  params: GenerateParams
): Promise<GeneratedQuestionDoc[]> {
  const apiKey = process.env.OPENROUTER_API_KEY || "";
  if (!apiKey) {
    throw new Error(
      "[ai] OPENROUTER_API_KEY is not set. Cannot generate questions."
    );
  }

  // Use only the primary model — no fallback
  const model = process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-8b-instruct:free";
  const openai = getOpenAIClient();

  const count = params.count || 20;
  const difficultyLabel =
    params.difficulty <= 1 ? "Easy (Level 1)"
    : params.difficulty <= 2 ? "Easy-Medium (Level 2)"
    : params.difficulty <= 3 ? "Medium (Level 3)"
    : params.difficulty <= 4 ? "Hard (Level 4)"
    : "Expert (Level 5)";

  const userPrompt = `Generate ${count} multiple choice questions.
- Stream: ${params.stream}
- Difficulty: ${difficultyLabel} — strictly adhere to this level.
- Focus Topics (distribute evenly): ${params.topics.join(", ")}`;

  let lastError: unknown = null;
  const MAX_ATTEMPTS = 2; // Try the model up to 2 times before giving up
  const TIMEOUT_MS = 30000; // 30 seconds per attempt

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      console.log(
        `[ai] Attempt ${attempt}/${MAX_ATTEMPTS} | model: ${model} | topics: ${params.topics.join(", ")}`
      );

      // Non-streaming call — wait up to 30s
      const response = await Promise.race([
        openai.chat.completions.create({
          model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 2048,
          stream: false,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error(`AI generation timed out after 30s`)),
            TIMEOUT_MS
          )
        ),
      ]);

      let content =
        (response as OpenAI.Chat.Completions.ChatCompletion).choices[0]
          ?.message?.content ?? "";

      // Strip any accidental markdown fences the model may emit
      content = content
        .replace(/^```json\s*/m, "")
        .replace(/^```\s*/m, "")
        .replace(/```\s*$/m, "")
        .trim();

      // Validate with Zod
      const rawParsed = JSON.parse(content);
      const validated = AIQuizResponseSchema.parse(rawParsed);

      // Map AI output → DB schema
      const documents = validated.questions.map((q, index) => {
        let matchedTopic = params.topics.find(
          (t) => t.toLowerCase() === q.topic.toLowerCase()
        );
        if (!matchedTopic) {
          matchedTopic = params.topics.find(
            (t) =>
              q.topic.toLowerCase().includes(t.toLowerCase()) ||
              t.toLowerCase().includes(q.topic.toLowerCase())
          );
        }
        if (!matchedTopic) {
          matchedTopic = params.topics[index % params.topics.length];
        }

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
          console.log(
            `[ai] Inserted ${documents.length} questions into the library.`
          );
        } else {
          console.log(`[ai] Generation complete. DB insert skipped.`);
        }
        return documents;
      }

      throw new Error("AI returned 0 valid questions.");
    } catch (error: unknown) {
      lastError = error;
      const msg = error instanceof Error ? error.message : String(error);
      console.warn(
        `[ai] Attempt ${attempt}/${MAX_ATTEMPTS} failed:`,
        error instanceof z.ZodError ? "Zod validation error" : msg
      );
      // If not on last attempt, wait 2s before retrying
      if (attempt < MAX_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
  }

  // All models failed - try to get questions from database as fallback ONLY if we really found nothing
  console.error("[ai] All generation attempts failed. Attempting database fallback...");
  
  try {
    const fallbackQuestions = await QuestionModel.find({
      stream: params.stream,
      difficulty: params.difficulty,
      topic: { $in: params.topics },
    })
      .limit(params.count || 20)
      .lean();

    if (fallbackQuestions.length > 0) {
      console.log(
        `[ai] Database fallback succeeded: returned ${fallbackQuestions.length} cached questions.`
      );
      return fallbackQuestions as GeneratedQuestionDoc[];
    }
  } catch (dbError) {
    console.error("[ai] Database fallback also failed:", dbError);
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(String(lastError ?? "Unknown AI error"));
}
