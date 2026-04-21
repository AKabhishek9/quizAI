import { GoogleGenerativeAI } from "@google/generative-ai";
import { QuestionModel } from "../models/Question.js";
import { z } from "zod";

// ── Google AI Studio — Native Gemini SDK ──────────────────────────────────────
// Uses @google/generative-ai (official SDK) instead of the OpenAI compat layer
// which was returning 400 errors for AI Studio project keys.
// API key from: https://aistudio.google.com/apikey  (never shipped to browser)
let genAIInstance: GoogleGenerativeAI | null = null;

function getGenAIClient(): GoogleGenerativeAI {
  if (!genAIInstance) {
    const key = process.env.GOOGLE_AI_API_KEY?.trim() || "";
    genAIInstance = new GoogleGenerativeAI(key);
  }
  return genAIInstance;
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

// ── Main generation function ──────────────────────────────────────────────────
export async function generateQuestions(
  params: GenerateParams
): Promise<GeneratedQuestionDoc[]> {
  const apiKey = process.env.GOOGLE_AI_API_KEY?.trim() || "";
  if (!apiKey) {
    throw new Error(
      "[ai] GOOGLE_AI_API_KEY is not set. Cannot generate questions."
    );
  }

  const primaryModel = process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";
  const fallbackModels = ["gemini-1.5-flash", "gemini-1.5-pro"];
  const allModels = [primaryModel, ...fallbackModels.filter(m => m !== primaryModel)];

  const genAI = getGenAIClient();
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
  const MAX_ATTEMPTS_PER_MODEL = 1;
  const TIMEOUT_MS = 60_000;

  for (const modelName of allModels) {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_MODEL; attempt++) {
      try {
        console.log(
          `[ai] Attempting ${modelName} | topics: ${params.topics.join(", ")}`
        );

        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: SYSTEM_PROMPT,
        });

        const result = await Promise.race([
          model.generateContent({
            contents: [{ role: "user", parts: [{ text: userPrompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 4096,
            },
          }),
          new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new Error(`AI generation timed out after ${TIMEOUT_MS / 1000}s`)),
              TIMEOUT_MS
            )
          ),
        ]);


      let content = result.response.text();

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
      // Log full error details for debugging
      if (error && typeof error === "object" && "status" in error) {
        const apiErr = error as any;
        console.error(`[ai] API ERROR — status: ${apiErr.status}, message: ${apiErr.message}`);
        if (apiErr.error) console.error(`[ai] API error body:`, JSON.stringify(apiErr.error));
      }
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

  // All attempts failed — try database fallback
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
