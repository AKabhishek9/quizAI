import type { Quiz, QuizAttempt, UserProfile, UserStats } from "./types";
import { request } from "./api-client";

// ──────────────────────────────────────────────
// Quiz API
// ──────────────────────────────────────────────

export async function getQuizzes(): Promise<Quiz[]> {
  // Return empty until a global Quiz Library/Browser is implemented
  return [];
}

export async function getQuiz(_id: string): Promise<Quiz | null> {
  // Dynamic fetching by ID is not yet implemented on backend
  return null;
}

// ──────────────────────────────────────────────
// User API (Unified Dashboard)
// ──────────────────────────────────────────────

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

export async function getQuizAttemptById(_id: string): Promise<Record<string, unknown> | null> {
  return request<Record<string, unknown> | null>(`/quiz-attempt/${id}`);
}

export async function getLeaderboard(): Promise<Record<string, unknown>[]> {
  return request<Record<string, unknown>[]>("/leaderboard");
}
