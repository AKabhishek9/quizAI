import { useState, useCallback } from "react";
import type { Quiz } from "@/lib/types";

export type QuizState = "idle" | "playing" | "completed";

export function useQuiz(quiz: Quiz | null) {
  const [state, setState] = useState<QuizState>("idle");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const startQuiz = useCallback(() => {
    setState("playing");
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setAnswers({});
  }, []);

  const selectAnswer = useCallback((optionId: string) => {
    if (showFeedback) return;
    setSelectedAnswer(optionId);
  }, [showFeedback]);

  const submitAnswer = useCallback(() => {
    if (!quiz || !selectedAnswer || showFeedback) return;
    
    const currentQuestion = quiz.questions[currentQuestionIndex];
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: selectedAnswer }));
    setShowFeedback(true);
  }, [quiz, selectedAnswer, currentQuestionIndex, showFeedback]);

  const nextQuestion = useCallback(() => {
    if (!quiz) return;

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      setState("completed");
    }
  }, [quiz, currentQuestionIndex]);

  const getResults = useCallback(() => {
    if (!quiz) return { score: 0, correctAnswers: 0, incorrectAnswers: 0, skippedAnswers: 0, weakTopics: [] };

    let correct = 0;
    const weakTopicsMap = new Set<string>();

    quiz.questions.forEach((q) => {
      const answer = answers[q.id];
      if (answer === q.correctOptionId) {
        correct++;
      } else if (answer) {
        if (q.topic) weakTopicsMap.add(q.topic);
      }
    });

    const total = quiz.questions.length;
    const score = Math.round((correct / total) * 100);

    return {
      score,
      correctAnswers: correct,
      incorrectAnswers: Object.keys(answers).length - correct,
      skippedAnswers: total - Object.keys(answers).length,
      weakTopics: Array.from(weakTopicsMap),
    };
  }, [quiz, answers]);

  const currentQuestion = quiz?.questions[currentQuestionIndex];
  const isCorrect = currentQuestion ? selectedAnswer === currentQuestion.correctOptionId : false;

  return {
    state,
    currentQuestionIndex,
    selectedAnswer,
    showFeedback,
    isCorrect,
    startQuiz,
    selectAnswer,
    submitAnswer,
    nextQuestion,
    getResults,
  };
}
