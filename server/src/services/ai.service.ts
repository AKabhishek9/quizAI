import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { QuestionModel } from "../models/Question.js";
import { z } from "zod";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

// Use the SDK instead of raw fetch — avoids leaking the API key in URLs/logs
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Zod Schema for robust AI response validation
 */
const AIQuestionSchema = z.object({
  question: z.string().min(5),
  options: z.array(z.string()).min(2).max(6),
  answer: z.number().int().min(0).max(5),
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
}

export interface AIQuestion extends z.infer<typeof AIQuestionSchema> {}

const SYSTEM_PROMPT = `
You are an expert technical assessor generating high-quality multiple choice questions.
Your goal is to output JSON measuring knowledge gaps accurately.

Output exact JSON strictly adhering to this format:
{
  "questions": [
    {
      "question": "A clear, unambiguous question text",
      "options": ["A", "B", "C", "D"],
      "answer": 2, 
      "topic": "The general topic this belongs to (e.g., Arrays)",
      "concept": "The precise sub-topic or core concept tested (e.g., Two Pointer Technique)"
    }
  ]
}

Guidelines:
1. Provide exactly the number of questions requested.
2. The "answer" field MUST be the 0-indexed integer of the correct option matching the options array.
3. Keep the questions at the requested difficulty strictly (1=Beginner, 5=Expert).
4. Distribute the questions evenly among the provided focus topics.
5. Ensure options are distinct, plausible, and only one is unarguably correct.
6. Provide only the JSON, no markdown formatting blocks, no explanations.
`;

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

export async function generateQuestions(params: GenerateParams): Promise<GeneratedQuestionDoc[]> {
  if (!GEMINI_API_KEY) {
    throw new Error("[ai] Gemini API key missing. Cannot generate new questions.");
  }
  
  const count = params.count || 20;
  const userPrompt = `
Generate ${count} multiple choice questions.
- Stream: ${params.stream}
- Difficulty Level (1-5): ${params.difficulty}
- Focus Topics (distribute evenly): ${params.topics.join(", ")}
  `;

  let lastError: unknown = null;
  const maxRetries = 2;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[ai] Generation attempt ${attempt}/${maxRetries} for topics: ${params.topics.join(", ")}`);
      
      // Use the Gemini SDK — API key is sent securely via the SDK, not in URLs
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      const result = await Promise.race([
        model.generateContent({
          contents: [{ role: "user", parts: [{ text: `${SYSTEM_PROMPT}\n\n${userPrompt}` }] }],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
        // 30s timeout
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Gemini API timeout (30s)")), 30000)
        ),
      ]);

      const response = result.response;
      let content = response.text();
      
      // Strip markdown formatting (safety net — shouldn't be needed with responseMimeType)
      content = content.replace(/^```json\n?/, "").replace(/^```\n?/, "").replace(/\n?```$/m, "").trim();

      // Robust Parsing & Validation
      const rawParsed = JSON.parse(content);
      const validated = AIQuizResponseSchema.parse(rawParsed);

      // Map AI output to DB schema, ensuring the topic matches
      const documents = validated.questions.map((q, index) => {
        let matchedTopic = params.topics.find(t => t.toLowerCase() === q.topic.toLowerCase());
        if (!matchedTopic) {
          matchedTopic = params.topics.find(t => q.topic.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(q.topic.toLowerCase()));
        }
        if (!matchedTopic) {
          matchedTopic = params.topics[index % params.topics.length];
        }

        return {
          question: q.question,
          options: q.options,
          answer: q.answer,
          stream: params.stream,
          subject: params.subject || "Mixed",
          topic: matchedTopic,
          concept: q.concept,
          difficulty: params.difficulty,
        };
      });

      if (documents.length > 0) {
        await QuestionModel.insertMany(documents);
        console.log(`[ai] Successfully inserted ${documents.length} questions.`);
        return documents;
      }
      
      throw new Error("AI returned 0 valid questions.");

    } catch (error: unknown) {
      lastError = error;
      const msg = error instanceof Error ? error.message : String(error);
      console.warn(`[ai] Attempt ${attempt} failed:`, error instanceof z.ZodError ? "Validation Error" : msg);
    }
  }

  console.error("[ai] All generation attempts failed.");
  throw lastError instanceof Error ? lastError : new Error(String(lastError ?? "Unknown AI error"));
}
