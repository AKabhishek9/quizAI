"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuizIdleState } from "@/components/quiz/quiz-idle-state";
import { QuizPlayingState } from "@/components/quiz/quiz-playing-state";
import { QuizCompletedState } from "@/components/quiz/quiz-completed-state";
import { useQuiz } from "@/hooks/use-quiz";
import { useTimer } from "@/hooks/use-timer";
import { getQuizById, submitQuizAnswers, type ApiSubmitResponse } from "@/lib/api-client";
import { type Quiz } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function QuizPlayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<ApiSubmitResponse | null>(null);
  const [showLevelToast, setShowLevelToast] = useState(false);

  const {
    state,
    currentQuestionIndex,
    selectedAnswer,
    showFeedback,
    isCorrect,
    startQuiz,
    selectAnswer,
    submitAnswer,
    nextQuestion,
    answers,
  } = useQuiz(quiz);

  const currentQuestion = quiz?.questions[currentQuestionIndex] ?? null;
  const totalTime = quiz?.timePerQuestion ?? 30;

  const timer = useTimer(totalTime, () => {
    if (state === "playing" && !showFeedback) {
      submitAnswer();
    }
  });

  useEffect(() => {
    async function load() {
      const data = await getQuizById(id);
      setQuiz(data);
      setLoading(false);
    }
    load();
  }, [id]);

  useEffect(() => {
    if (state === "playing" && !showFeedback) {
      timer.reset(totalTime);
      timer.start();
    }
  }, [currentQuestionIndex, state]);

  useEffect(() => {
    if (showFeedback) timer.pause();
  }, [showFeedback]);

  // Handle auto-submission when quiz completes
  useEffect(() => {
    if (state === "completed" && !submitResult && !submitting) {
      handleFinalSubmit();
    }
  }, [state]);

  const handleFinalSubmit = async () => {
    if (!quiz) return;
    setSubmitting(true);
    try {
      const payload = {
        answers: Object.entries(answers).map(([qId, optionId]) => {
          // Find the index of the selected option
          const question = quiz.questions.find(q => q.id === qId);
          const optionIndex = question?.options.findIndex(o => o.id === optionId) ?? 0;
          return {
            questionId: qId,
            selectedOption: optionIndex
          };
        })
      };

      const result = await submitQuizAnswers(payload);
      setSubmitResult(result);
      
      // Trigger level up toast if level increased
      if (result.levelChange > 0) {
        setShowLevelToast(true);
      }
    } catch (error) {
      console.error("Failed to submit quiz results:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-20">
        <h2 className="text-lg font-semibold">Quiz not found</h2>
        <p className="text-xs text-muted-foreground mt-1">
          This quiz doesn&apos;t exist.
        </p>
        <Button
          onClick={() => router.push("/quiz")}
          size="sm"
          className="mt-4 cursor-pointer"
        >
          Back to quizzes
        </Button>
      </div>
    );
  }

  /* ── Idle ── */
  if (state === "idle") {
    return (
      <QuizIdleState
        title={quiz.title}
        description={quiz.description}
        questionCount={quiz.questionCount}
        timePerQuestion={quiz.timePerQuestion}
        difficulty={quiz.difficulty}
        onStart={startQuiz}
      />
    );
  }

  /* ── Completed ── */
  if (state === "completed") {
    const accuracy = submitResult?.accuracy ?? 0;
    const correctCount = Math.round((accuracy / 100) * quiz.questionCount);

    return (
      <QuizCompletedState
        accuracy={accuracy}
        correctCount={correctCount}
        questionCount={quiz.questionCount}
        xpAwarded={submitResult?.xpAwarded}
        newLevel={submitResult?.newLevel}
        showLevelToast={showLevelToast}
        setShowLevelToast={setShowLevelToast}
      />
    );
  }

  /* ── Playing ── */
  return (
    <QuizPlayingState
      currentQuestionIndex={currentQuestionIndex}
      questionCount={quiz.questionCount}
      timeRemaining={timer.timeRemaining}
      totalTime={totalTime}
      currentQuestion={currentQuestion}
      selectedAnswer={selectedAnswer}
      showFeedback={showFeedback}
      isCorrect={isCorrect}
      submitAnswer={submitAnswer}
      selectAnswer={selectAnswer}
      nextQuestion={nextQuestion}
      difficulty={quiz.difficulty}
    />
  );
}
