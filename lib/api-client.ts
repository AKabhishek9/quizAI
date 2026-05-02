import type { Auth } from "firebase/auth";
import type { Quiz, QuizAttempt, UserProfile, UserStats } from "./types";
// ──────────────────────────────────────────────
// API Client — connects to the Express backend
// ──────────────────────────────────────────────

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

import { auth } from "./firebase";

export async function getAuthHeaders() {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (auth && auth.currentUser) {
    const token = await auth.currentUser.getIdToken();
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

/** Thin fetch wrapper with error handling and configurable timeout */
export async function request<T>(
  url: string,
  options?: RequestInit,
  timeoutMs: number = 15_000
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_BASE}${url}`, {
      headers: await getAuthHeaders(),
      signal: controller.signal,
      ...options,
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      // Use the standardized error message if available
      const message = body.error || `Request failed: ${res.status}`;
      throw new Error(message);
    }

    // Standardized response handling: unwrap 'data' if it exists and success is true
    if (body.success === true && body.data !== undefined) {
      return body.data as T;
    }

    return body as T;
  } catch (err: unknown) {

    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error(
        "Quiz generation is taking longer than expected. The AI model may be busy — please try again in a moment."
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/* ── Types matching the backend response ── */

export interface ApiQuestion {
  _id: string;
  question: string;
  options: string[];
  topic?: string;
  concept: string;
  difficulty: number;
}

export interface ApiQuizResponse {
  questions?: ApiQuestion[];
  status?: "generating";
  jobId?: string;
}

export interface JobStatusResponse {
  status: "queued" | "running" | "done" | "failed";
  error?: string;
  result?: ApiQuestion[];
}

export async function getQuizJobStatus(jobId: string): Promise<JobStatusResponse> {
  return request<JobStatusResponse>(`/quiz-job/${jobId}`);
}


export interface ApiSubmitPayload {
  answers: {
    questionId: string;
    selectedOption: number;
  }[];
}

export interface ApiSubmitResponse {
  score: number;
  total: number;
  accuracy: number;
  levelChange: number;
  newLevel: number;
  xpAwarded: number;
  attemptId: string;
  conceptBreakdown: {
    concept: string;
    correct: number;
    total: number;
  }[];
}

/** Response from daily quiz submission */
export interface DailySubmitResponse {
  score: number;
  total: number;
  correct: number;
  results: {
    question: string;
    isCorrect: boolean;
    correctAnswer: number;
    userAnswer: number | undefined;
  }[];
  streak: {
    currentStreak: number;
    bestStreak: number;
    isNewStreak: boolean;
    xpGained: number;
    totalXp: number;
    currentLevel: number;
    didLevelUp: boolean;
  } | null;
}

/** Summary of a daily quiz category (from getDailyQuizzes) */
export interface DailyQuizSummary {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  theme: string;
  color: string;
  expiresAt?: string;
  questions: ApiQuestion[];
}

/** Detailed daily quiz (from getDailyQuiz) */
export interface DailyQuizDetail {
  _id: string;
  category: string;
  categoryKey: string;
  title: string;
  theme: string;
  questions: ApiQuestion[];
  timePerQuestion: number;
}

/* ── API methods ── */

/**
 * Adaptive mixed quiz generation.
 * Previously named 'getQuiz', now 'generateQuiz' to avoid naming collisions.
 */
export async function generateQuiz(
  stream: string,
  topics: string[],
  difficulty: number = 3,
  useFallback: boolean = false
): Promise<ApiQuizResponse> {
  // AI generation can be slow on free models — allow up to 90 seconds
  return request<ApiQuizResponse>(
    "/get-quiz",
    {
      method: "POST",
      body: JSON.stringify({ stream, topics, difficulty, useFallback }),
      cache: "no-store",
    },
    90_000 // 90s timeout for AI quiz generation
  );
}

export async function submitQuizAnswers(payload: ApiSubmitPayload): Promise<ApiSubmitResponse> {
  return request<ApiSubmitResponse>("/submit-quiz", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function checkHealth(): Promise<{ status: string }> {
  return request<{ status: string }>("/health");
}

/* ── Unified Dashboard & Activity ── */

/**
 * Unified fetch for all dashboard components.
 * Solves the triple-fetch problem where Profile, Stats, and History 
 * previously made separate API calls to the same endpoint.
 */
export async function getUserDashboard(): Promise<{
  profile: UserProfile;
  stats: UserStats;
  history: QuizAttempt[]
}> {
  return request<{
    profile: UserProfile;
    stats: UserStats;
    history: QuizAttempt[];
  }>("/user/dashboard");
}

export async function getQuizAttemptById(id: string): Promise<Record<string, unknown> | null> {
  return request<Record<string, unknown> | null>(`/quiz-attempt/${id}`);
}

export async function getLeaderboard(): Promise<Record<string, unknown>[]> {
  return request<Record<string, unknown>[]>("/leaderboard");
}

export async function getQuizzes(): Promise<Quiz[]> {
  return request<Quiz[]>("/quiz/all");
}

/** Get today's active daily quizzes mapped by category */
export async function getDailyQuizzes(): Promise<Record<string, DailyQuizSummary>> {
  const result = await request<{ quizzes: Record<string, DailyQuizSummary>; expiresAt: string | null }>("/daily");
  return result.quizzes ?? {};
}

/** Get a specific daily quiz by its ID (alias for getDailyQuiz) */
export const getDailyQuizById = getDailyQuiz;

/** Get a specific daily quiz by its category ID */
export async function getDailyQuiz(id: string): Promise<DailyQuizDetail> {
  return request<DailyQuizDetail>(`/daily/${id}`);
}

/** Submit daily quiz result (alias for submitDailyQuiz) */
export const submitDailyQuizSolution = submitDailyQuiz;

/** Submit daily quiz result and update streak */
export async function submitDailyQuiz(id: string, answers: { questionId: string; selectedOption: number }[]): Promise<DailySubmitResponse> {
  return request<DailySubmitResponse>(`/daily/${id}/submit`, {
    method: "POST",
    body: JSON.stringify({ answers }),
  });
}

/** Admin/Manual trigger for daily quiz generation */
export async function triggerDailyRefresh(): Promise<{ message: string }> {
  return request<{ message: string }>("/daily/refresh", {
    method: "POST",
  });
}
