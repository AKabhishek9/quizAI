"use client";

import { useState, useCallback, useRef } from "react";
import { generateQuiz, submitQuizAnswers } from "@/lib/api-client";
import type { ApiSubmitResponse, ApiQuestion } from "@/lib/api-client";
import { toPlayableQuestion, optionIdToIndex } from "@/lib/transforms";
import type { Question } from "@/lib/types";

export type DifficultyLabel = "easy" | "medium" | "hard";

/** Maps user-facing difficulty label to the numeric 1-5 scale used by the backend */
function difficultyToNumber(label: DifficultyLabel): number {
  switch (label) {
    case "easy":   return 1;
    case "medium": return 3;
    case "hard":   return 5;
  }
}

type AdaptiveQuizState = "idle" | "loading" | "playing" | "submitting" | "completed" | "error";

interface UseAdaptiveQuizReturn {
  state: AdaptiveQuizState;
  error: string | null;
  questions: Question[];
  currentQuestionIndex: number;
  /** The currently displayed answer (from persisted map or live selection) */
  selectedAnswer: string | null;
  answers: Map<string, string>;
  totalQuestions: number;
  result: ApiSubmitResponse | null;
  startQuiz: (stream: string, topics: string[], difficulty?: DifficultyLabel, useFallback?: boolean) => Promise<void>;
  selectAnswer: (optionId: string) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  submitToBackend: () => Promise<void>;
  reset: () => void;
}

export function useAdaptiveQuiz(): UseAdaptiveQuizReturn {
  const [state, setState] = useState<AdaptiveQuizState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  // answers is the single source of truth: questionId → optionId
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [result, setResult] = useState<ApiSubmitResponse | null>(null);

  const rawQuestionsRef = useRef<ApiQuestion[]>([]);

  const startQuiz = useCallback(
    async (
      stream: string,
      topics: string[],
      difficulty: DifficultyLabel = "medium",
      useFallback: boolean = false
    ) => {
      setState("loading");
      setError(null);
      setQuestions([]);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setAnswers(new Map());
      setResult(null);

      try {
        const numericDifficulty = difficultyToNumber(difficulty);
        const response = await generateQuiz(stream, topics, numericDifficulty, useFallback);

        if (!response.questions || response.questions.length === 0) {
          setError("AI Generation timed out. Please try again, or use the fallback model.");
          setState("error");
          return;
        }

        rawQuestionsRef.current = response.questions;
        setQuestions(response.questions.map(toPlayableQuestion));
        setState("playing");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load quiz");
        setState("error");
      }
    },
    []
  );

  const selectAnswer = useCallback((optionId: string) => {
    setSelectedAnswer(optionId);
  }, []);

  /**
   * Save the current answer (if any) and advance to next question.
   * On the last question, persists answer and submits.
   */
  const nextQuestion = useCallback(() => {
    const questionId = questions[currentQuestionIndex]?.id;

    // Persist whichever answer is selected (may be null if user skips — we allow that on prev/next)
    const updatedAnswers = new Map(answers);
    if (questionId && selectedAnswer) {
      updatedAnswers.set(questionId, selectedAnswer);
    }
    setAnswers(updatedAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      // Move forward — restore any prior answer for the next question
      const nextId = questions[currentQuestionIndex + 1]?.id;
      setSelectedAnswer(nextId ? (updatedAnswers.get(nextId) ?? null) : null);
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Last question — submit
      submitWithAnswers(updatedAnswers);
    }
  }, [selectedAnswer, currentQuestionIndex, questions, answers]);

  /**
   * Save the current answer and go back one question, restoring the prior answer.
   */
  const prevQuestion = useCallback(() => {
    if (currentQuestionIndex <= 0) return;

    const questionId = questions[currentQuestionIndex]?.id;

    // Persist current answer before going back
    const updatedAnswers = new Map(answers);
    if (questionId && selectedAnswer) {
      updatedAnswers.set(questionId, selectedAnswer);
    }
    setAnswers(updatedAnswers);

    // Restore the prior question's answer
    const prevId = questions[currentQuestionIndex - 1]?.id;
    setSelectedAnswer(prevId ? (updatedAnswers.get(prevId) ?? null) : null);
    setCurrentQuestionIndex((prev) => prev - 1);
  }, [selectedAnswer, currentQuestionIndex, questions, answers]);

  const submitWithAnswers = async (allAnswers: Map<string, string>) => {
    setState("submitting");
    setError(null);

    try {
      const submissionAnswers = Array.from(allAnswers.entries()).map(
        ([questionId, optionId]) => ({
          questionId,
          selectedOption: optionIdToIndex(optionId),
        })
      );

      const response = await submitQuizAnswers({ answers: submissionAnswers });
      setResult(response);
      setState("completed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit quiz");
      setState("error");
    }
  };

  const submitToBackend = useCallback(async () => {
    await submitWithAnswers(answers);
  }, [answers]);

  const reset = useCallback(() => {
    setState("idle");
    setError(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswers(new Map());
    setResult(null);
    rawQuestionsRef.current = [];
  }, []);

  return {
    state,
    error,
    questions,
    currentQuestionIndex,
    selectedAnswer,
    answers,
    totalQuestions: questions.length,
    result,
    startQuiz,
    selectAnswer,
    nextQuestion,
    prevQuestion,
    submitToBackend,
    reset,
  };
}
