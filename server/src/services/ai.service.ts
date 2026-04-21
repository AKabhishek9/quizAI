import OpenAI from "openai";
import { QuestionModel } from "../models/Question.js";
import { z } from "zod";

// ── OpenRouter API Configuration (Server-side only) ──────────────────────────
// The API key is read from OPENROUTER_API_KEY environment variable.
// It is NEVER shipped to the browser — this file only runs on the Express server.
// Removed static initialization because dotenv might not be imported yet due to ES module hoisting.
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

Rules:
1. Provide exactly the number of questions requested.
2. "answer" MUST be the 0-indexed integer of the correct option in the options array.
3. Keep difficulty strictly to the requested level (1=Beginner, 5=Expert).
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

  const primaryModel = process.env.OPENROUTER_MODEL || "openrouter/free";
  const fallbackModel = process.env.OPENROUTER_FALLBACK_MODEL || "openrouter/auto";
  const openai = getOpenAIClient();

  const count = params.count || 20;
  const userPrompt = `Generate ${count} multiple choice questions.
- Stream: ${params.stream}
- Difficulty Level (1-5): ${params.difficulty}
- Focus Topics (distribute evenly): ${params.topics.join(", ")}`;

  let lastError: unknown = null;
  const models = [primaryModel, fallbackModel]; // Try primary first, then fallback
  const maxRetriesPerModel = 1; // Retry once per model = 2 total attempts

  for (const model of models) {
    for (let attempt = 1; attempt <= maxRetriesPerModel; attempt++) {
      try {
        console.log(
          `[ai] Attempt (${model}/${attempt}/${maxRetriesPerModel}) | topics: ${params.topics.join(", ")}`
        );

        // Non-streaming call — we need the full JSON before we can parse it
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
          // 8-second hard timeout for OpenRouter (faster than NVIDIA)
          new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new Error(`OpenRouter API timeout after 8s (${model})`)),
              8000
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
              `[ai] Inserted ${documents.length} questions into the library (model: ${model}).`
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
          `[ai] ${model} attempt ${attempt} failed:`,
          error instanceof z.ZodError ? "Zod validation error" : msg
        );

        // Only retry if it's a potentially transient error
        if (
          error instanceof z.ZodError ||
          (error instanceof Error && 
            (error.message.includes("timeout") ||
             error.message.includes("429") ||
             error.message.includes("500")))
        ) {
          // Continue to retry or next model
        } else if (attempt === maxRetriesPerModel) {
          // Permanent error, move to fallback model
          console.warn(
            `[ai] ${model} failed permanently, trying fallback model...`
          );
        }
      }
    }
  }

  // All models failed - try to get questions from database as fallback
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
