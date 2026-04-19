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
  
  if (auth && (auth as any).currentUser) {
    const token = await (auth as any).currentUser.getIdToken();
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

/** Thin fetch wrapper with error handling */
export async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: await getAuthHeaders(),
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
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
  questions: ApiQuestion[];
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
  attemptId: string;
  conceptBreakdown: {
    concept: string;
    correct: number;
    total: number;
  }[];
}

/* ── API methods ── */

/**
 * Adaptive mixed quiz generation.
 * Previously named 'getQuiz', now 'generateQuiz' to avoid naming collisions.
 */
export async function generateQuiz(
  stream: string,
  topics: string[],
  difficulty: number = 3
): Promise<ApiQuizResponse> {
  return request<ApiQuizResponse>("/get-quiz", {
    method: "POST",
    body: JSON.stringify({ stream, topics, difficulty }),
    cache: "no-store",
  });
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
  // Return empty until a global Quiz Library/Browser is implemented
  return [];
}

export async function getQuizById(id: string): Promise<Quiz | null> {
  // Dynamic fetching by ID is not yet implemented on backend
  return null;
}
