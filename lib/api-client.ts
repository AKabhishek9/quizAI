// ──────────────────────────────────────────────
// API Client — connects to the Express backend
// ──────────────────────────────────────────────

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

import { auth } from "./firebase";

export async function getAuthHeaders() {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
import type { Auth } from "firebase/auth";

  if (auth && (auth as Auth).currentUser) {
    const token = await (auth as Auth).currentUser!.getIdToken();
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

export async function getQuiz(stream: string, topics: string[], difficulty?: number): Promise<ApiQuizResponse> {
  const response = await fetch(`${API_BASE}/get-quiz`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify({ stream, topics, difficulty }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Failed to fetch quiz: ${response.statusText}`);
  }

  return response.json();
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
