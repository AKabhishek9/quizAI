"use client";

import { useState, useCallback, useRef } from "react";
import { generateQuiz, submitQuizAnswers } from "@/lib/api-client";
import type { ApiSubmitResponse, ApiQuestion } from "@/lib/api-client";
import { toPlayableQuestion, optionIdToIndex } from "@/lib/transforms";
import type { Question } from "@/lib/types";

type AdaptiveQuizState = "idle" | "loading" | "playing" | "submitting" | "completed" | "error";

interface UseAdaptiveQuizReturn {
  state: AdaptiveQuizState;
  error: string | null;
  questions: Question[];
  currentQuestionIndex: number;
  selectedAnswer: string | null;
  answers: Map<string, string>;
  totalQuestions: number;
  result: ApiSubmitResponse | null;
  startQuiz: (stream: string, topics: string[]) => Promise<void>;
  selectAnswer: (optionId: string) => void;
  nextQuestion: () => void;
  submitToBackend: () => Promise<void>;
  reset: () => void;
}

export function useAdaptiveQuiz(): UseAdaptiveQuizReturn {
  const [state, setState] = useState<AdaptiveQuizState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [result, setResult] = useState<ApiSubmitResponse | null>(null);

  const rawQuestionsRef = useRef<ApiQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const startQuiz = useCallback(async (stream: string, topics: string[]) => {
    setState("loading");
    setIsGenerating(true);
    setError(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswers(new Map());
    setResult(null);

    let maxRetries = 20;
    let delayMs = 3000;

    try {
      let response = await generateQuiz(stream, topics);

      // Poll if the backend scheduled a background job and returned empty
      while (
        (!response.questions || response.questions.length === 0) &&
        maxRetries > 0
      ) {
        maxRetries--;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        response = await generateQuiz(stream, topics);
      }

      if (!response.questions || response.questions.length === 0) {
        setError("AI Generation timed out. The server is heavily loaded, please try again.");
        setState("error");
        setIsGenerating(false);
        return;
      }

      rawQuestionsRef.current = response.questions;
      setQuestions(response.questions.map(toPlayableQuestion));
      setState("playing");
      setIsGenerating(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load quiz");
      setState("error");
      setIsGenerating(false);
    }
  }, []);

  const selectAnswer = useCallback((optionId: string) => {
    setSelectedAnswer(optionId);
  }, []);

  const nextQuestion = useCallback(() => {
    if (!selectedAnswer) return;

    const questionId = questions[currentQuestionIndex]?.id;
    if (questionId) {
      setAnswers((prev) => {
        const next = new Map(prev);
        next.set(questionId, selectedAnswer);
        return next;
      });
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      const finalAnswers = new Map(answers);
      if (questionId) {
        finalAnswers.set(questionId, selectedAnswer);
      }
      setAnswers(finalAnswers);
      submitWithAnswers(finalAnswers);
    }
   
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

      const response = await submitQuizAnswers({
        answers: submissionAnswers,
      });

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
    submitToBackend,
    reset,
  };
}
