"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuizOption } from "@/components/quiz/quiz-option";
import { QuizTimer } from "@/components/quiz/quiz-timer";
import { DifficultyBadge } from "@/components/quiz/difficulty-badge";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { useQuiz } from "@/hooks/use-quiz";
import { useTimer } from "@/hooks/use-timer";
import { getQuiz } from "@/lib/api";
import type { Quiz } from "@/lib/types";
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
    getResults,
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
      const data = await getQuiz(id);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, state]);

  useEffect(() => {
    if (showFeedback) timer.pause();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFeedback]);

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
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto text-center py-16"
      >
        <div className="rounded-xl border border-border bg-card p-8">
          <DifficultyBadge difficulty={quiz.difficulty} className="mb-3" />
          <h1 className="text-lg font-semibold tracking-tight mb-1">
            {quiz.title}
          </h1>
          <p className="text-xs text-muted-foreground mb-5">
            {quiz.description}
          </p>
          <div className="flex justify-center gap-5 text-[11px] text-muted-foreground mb-6">
            <span>{quiz.questionCount} questions</span>
            <span>{quiz.timePerQuestion}s per question</span>
          </div>
          <Button
            onClick={startQuiz}
            className="cursor-pointer h-9 px-6 text-sm font-medium"
          >
            Start quiz
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </div>
      </motion.div>
    );
  }

  /* ── Completed ── */
  if (state === "completed") {
    const results = getResults();
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto text-center py-16"
      >
        <div className="rounded-xl border border-border bg-card p-8">
          <div
            className={cn(
              "text-5xl font-semibold tracking-tight mb-1",
              results.score >= 80
                ? "text-success"
                : results.score >= 50
                ? "text-warning"
                : "text-destructive"
            )}
          >
            {results.score}%
          </div>
          <p className="text-xs text-muted-foreground mb-5">
            {results.correctAnswers} of {quiz.questionCount} correct
          </p>

          <div className="grid grid-cols-3 gap-2 mb-5">
            <div className="rounded-lg bg-success/[0.06] border border-success/10 p-3">
              <p className="text-base font-semibold text-success">{results.correctAnswers}</p>
              <p className="text-[11px] text-muted-foreground">Correct</p>
            </div>
            <div className="rounded-lg bg-destructive/[0.06] border border-destructive/10 p-3">
              <p className="text-base font-semibold text-destructive">{results.incorrectAnswers}</p>
              <p className="text-[11px] text-muted-foreground">Wrong</p>
            </div>
            <div className="rounded-lg bg-secondary p-3">
              <p className="text-base font-semibold">{results.skippedAnswers}</p>
              <p className="text-[11px] text-muted-foreground">Skipped</p>
            </div>
          </div>

          {results.weakTopics.length > 0 && (
            <div className="mb-5">
              <p className="text-[11px] text-muted-foreground mb-2">Weak areas</p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {results.weakTopics.map((topic) => (
                  <span
                    key={topic}
                    className="px-2 py-0.5 text-[11px] rounded-md bg-secondary text-muted-foreground"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/quiz")}
              className="cursor-pointer h-8 text-xs"
            >
              <RotateCcw className="mr-1 h-3 w-3" />
              More quizzes
            </Button>
            <Button
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="cursor-pointer h-8 text-xs"
            >
              Dashboard
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  /* ── Playing ── */
  return (
    <div className="max-w-xl mx-auto space-y-5">
      {/* Top bar */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium tabular-nums">
            {currentQuestionIndex + 1}{" "}
            <span className="text-muted-foreground">/ {quiz.questionCount}</span>
          </span>
          <DifficultyBadge difficulty={quiz.difficulty} />
        </div>
        <QuizTimer timeRemaining={timer.timeRemaining} totalTime={totalTime} />
        <ProgressBar
          value={((currentQuestionIndex + 1) / quiz.questionCount) * 100}
          showPercentage={false}
          size="sm"
        />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.2 }}
          className="rounded-xl border border-border bg-card p-5"
        >
          <h2 className="text-[15px] font-medium leading-relaxed mb-5">
            {currentQuestion?.text}
          </h2>

          <div className="space-y-2" role="radiogroup" aria-label="Answer options">
            {currentQuestion?.options.map((option) => (
              <QuizOption
                key={option.id}
                option={option}
                isSelected={selectedAnswer === option.id}
                isCorrect={
                  showFeedback && selectedAnswer === option.id
                    ? isCorrect
                    : null
                }
                isRevealed={showFeedback}
                correctOptionId={currentQuestion.correctOptionId}
                onSelect={selectAnswer}
                disabled={showFeedback}
              />
            ))}
          </div>

          <AnimatePresence>
            {showFeedback && currentQuestion && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 p-3 rounded-lg bg-secondary/60 border border-border"
              >
                <p className="text-[11px] font-medium text-muted-foreground mb-0.5">
                  Explanation
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {currentQuestion.explanation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {/* Actions */}
      <div className="flex justify-end">
        {!showFeedback ? (
          <Button
            onClick={submitAnswer}
            disabled={!selectedAnswer}
            size="sm"
            className="cursor-pointer h-8 text-xs disabled:opacity-40"
          >
            Submit
          </Button>
        ) : (
          <Button
            onClick={nextQuestion}
            size="sm"
            className="cursor-pointer h-8 text-xs"
          >
            {currentQuestionIndex < quiz.questionCount - 1
              ? "Next"
              : "See results"}
            <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
