import OpenAI from "openai";
import { QuestionModel } from "../models/Question.js";
import { z } from "zod";

// ── NVIDIA NIM client (OpenAI-compatible, server-side only) ──────────────────
// The API key is read from the environment variable NVIDIA_API_KEY.
// It is NEVER shipped to the browser — this file only runs on the Express server.
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || "";
const NVIDIA_BASE_URL =
  process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1";
const NVIDIA_MODEL =
  process.env.NVIDIA_MODEL || "qwen/qwen3-coder-480b-a35b-instruct";

const openai = new OpenAI({
  apiKey: NVIDIA_API_KEY,
  baseURL: NVIDIA_BASE_URL,
});

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
  stream: string;
  subject: string;
  topic: string;
  concept: string;
  difficulty: number;
}

// ── Main generation function ──────────────────────────────────────────────────
export async function generateQuestions(
  params: GenerateParams
): Promise<GeneratedQuestionDoc[]> {
  if (!NVIDIA_API_KEY) {
    throw new Error(
      "[ai] NVIDIA_API_KEY is not set. Cannot generate questions."
    );
  }

  const count = params.count || 20;
  const userPrompt = `Generate ${count} multiple choice questions.
- Stream: ${params.stream}
- Difficulty Level (1-5): ${params.difficulty}
- Focus Topics (distribute evenly): ${params.topics.join(", ")}`;

  let lastError: unknown = null;
  const maxRetries = 2;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `[ai] Attempt ${attempt}/${maxRetries} | model: ${NVIDIA_MODEL} | topics: ${params.topics.join(", ")}`
      );

      // Non-streaming call — we need the full JSON before we can parse it
      const response = await Promise.race([
        openai.chat.completions.create({
          model: NVIDIA_MODEL,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.6,
          top_p: 0.8,
          max_tokens: 4096,
          stream: false, // must be false so we get the complete JSON in one shot
        }),
        // 60-second hard timeout
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error("NVIDIA API timeout after 60s")),
            60000
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
        `[ai] Attempt ${attempt} failed:`,
        error instanceof z.ZodError ? "Zod validation error" : msg
      );
    }
  }

  console.error("[ai] All generation attempts failed.");
  throw lastError instanceof Error
    ? lastError
    : new Error(String(lastError ?? "Unknown AI error"));
}
