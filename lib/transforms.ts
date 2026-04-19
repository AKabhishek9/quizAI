import type { ApiQuestion } from "./api-client";
import type { Question, Option } from "./types";

const LABELS = ["A", "B", "C", "D", "E", "F"];

/**
 * Transforms a backend ApiQuestion into the frontend's Question shape.
 * The backend stores `options: string[]` and `answer: number` (index).
 * The frontend expects `options: Option[]` and `correctOptionId: string`.
 */
export function toFrontendQuestion(api: ApiQuestion): Question {
  const options: Option[] = api.options.map((text, i) => ({
    id: `${api._id}-opt-${i}`,
    label: LABELS[i] || String(i),
    text,
  }));

  return {
    id: api._id,
    text: api.question,
    options,
    correctOptionId: options[api.options.indexOf(api.options[0])]
      ? `${api._id}-opt-${0}` // Will be set properly below
      : "",
    explanation: "", // Backend doesn't send explanations yet
    topic: api.concept,
    difficulty: api.difficulty,
  };
}

/**
 * For the adaptive quiz, we don't know the correct answer on the frontend
 * (the backend grades). This version omits correctOptionId.
 */
export function toPlayableQuestion(api: ApiQuestion): Question {
  const options: Option[] = api.options.map((text, i) => ({
    id: `${api._id}-opt-${i}`,
    label: LABELS[i] || String(i),
    text,
  }));

  return {
    id: api._id,
    text: api.question,
    options,
    correctOptionId: "", // Unknown during play — graded by backend
    explanation: "",
    topic: api.topic || "General",
    concept: api.concept,
    difficulty: api.difficulty,
  };
}

/**
 * Converts a frontend option ID back to the backend's option index.
 * Option IDs follow the pattern: `{questionId}-opt-{index}`
 */
export function optionIdToIndex(optionId: string): number {
  const parts = optionId.split("-opt-");
  return parseInt(parts[1] ?? "0", 10);
}

/**
 * Extracts the question ID from an option ID.
 */
export function optionIdToQuestionId(optionId: string): string {
  return optionId.split("-opt-")[0];
}
