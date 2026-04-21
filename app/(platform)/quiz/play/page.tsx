"use client";

import { useEffect, useState, Suspense, useMemo, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, AlertCircle, Loader2, TrendingUp, TrendingDown, Minus, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuizOption } from "@/components/quiz/quiz-option";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { useAdaptiveQuiz } from "@/hooks/use-adaptive-quiz";
import type { DifficultyLabel } from "@/hooks/use-adaptive-quiz";
import { cn } from "@/lib/utils";

function PlayQuizEngine() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const streamParam = searchParams.get("stream") || "General";
  const topicsParam = searchParams.get("topics") || "";
  const difficultyParam = (searchParams.get("difficulty") || "medium") as DifficultyLabel;
  const topicsArray = useMemo(() => (topicsParam ? topicsParam.split(",") : []), [topicsParam]);

  const {
    state,
    error,
    questions,
    currentQuestionIndex,
    selectedAnswer,
    totalQuestions,
    result,
    startQuiz,
    selectAnswer,
    nextQuestion,
    prevQuestion,
    reset,
  } = useAdaptiveQuiz();

  const startedRef = useRef(false);

  // Auto-start the generation if we have topics
  useEffect(() => {
    if (!startedRef.current && state === "idle" && topicsArray.length > 0) {
      startedRef.current = true;
      startQuiz(streamParam, topicsArray, difficultyParam);
    }
  }, [state, topicsArray, streamParam, difficultyParam, startQuiz]);

  // Keyboard navigation: ← previous, → next
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (state !== "playing") return;
      if (e.key === "ArrowLeft") {
        prevQuestion();
      } else if (e.key === "ArrowRight") {
        if (selectedAnswer) nextQuestion();
      }
    },
    [state, selectedAnswer, nextQuestion, prevQuestion]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const currentQuestion = questions[currentQuestionIndex] ?? null;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  // Elapsed counter so user can see AI is working
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (state !== "loading") {
      setElapsed(0);
      return;
    }
    setElapsed(0);
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [state]);

  /* ── Idle (Fallback if no params) ── */
  if (state === "idle") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center h-[50vh] space-y-4"
      >
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm font-medium text-muted-foreground">Initializing engine...</p>
      </motion.div>
    );
  }

  /* ── Loading / Generating / Submitting ── */
  if (state === "loading" || state === "submitting") {
    const isGenerating = state === "loading";
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center h-[60vh] space-y-6 text-center max-w-sm mx-auto"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
          <div className="relative bg-card border border-border p-4 rounded-2xl shadow-xl">
            {isGenerating ? (
              <Cpu className="h-8 w-8 text-primary animate-pulse" />
            ) : (
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            )}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-medium tracking-tight mb-1">
            {isGenerating ? "Synthesizing Protocol" : "Analyzing Results"}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {isGenerating
              ? "Our AI engine is generating your custom assessment. This may take up to 30 seconds."
              : "Calculating your adaptive metrics..."}
          </p>
          {isGenerating && (
            <p className="text-xs font-mono text-primary/70 mt-3 tabular-nums">
              {elapsed}s elapsed…
            </p>
          )}
        </div>
      </motion.div>
    );
  }

  /* ── Error ── */
  if (state === "error") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto text-center py-16"
      >
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-3" />
          <h2 className="text-base font-semibold text-foreground mb-1">Failed to load quiz</h2>
          <p className="text-sm text-muted-foreground mb-5">
            {error || "An unexpected error occurred. The AI generation might have timed out."}
          </p>
          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/quiz/stream")}
              className="cursor-pointer h-8 text-xs"
            >
              Change Topics
            </Button>
            <Button
              onClick={() => {
                startedRef.current = false;
                reset();
                startQuiz(streamParam, topicsArray, difficultyParam);
              }}
              size="sm"
              className="cursor-pointer bg-foreground text-background hover:bg-foreground/90 h-8 text-xs"
            >
              Retry Generation
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  /* ── Completed ── */
  if (state === "completed" && result) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto py-10 space-y-6"
      >
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Assessment Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            We have analyzed your performance across {topicsArray.length} topics.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 elevated grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center sm:text-left sm:border-r border-border sm:pr-6">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Accuracy
            </p>
            <div
              className={cn(
                "text-4xl font-semibold tracking-tight",
                result.accuracy >= 80
                  ? "text-success"
                  : result.accuracy >= 50
                  ? "text-warning"
                  : "text-destructive"
              )}
            >
              {result.accuracy}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {result.score} of {result.total} correct
            </p>
          </div>

          <div className="text-center sm:text-left sm:border-r border-border sm:pr-6">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Level Status
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-2xl font-semibold">
              Level {result.newLevel}
              {result.levelChange > 0 && <TrendingUp className="h-5 w-5 text-success" />}
              {result.levelChange < 0 && <TrendingDown className="h-5 w-5 text-destructive" />}
              {result.levelChange === 0 && <Minus className="h-5 w-5 text-muted-foreground" />}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {result.levelChange > 0
                ? "Level up! Great job."
                : result.levelChange < 0
                ? "Level dropped. Keep practicing."
                : "No level change."}
            </p>
          </div>

          <div className="text-center sm:text-left overflow-y-auto max-h-[140px] pr-2 custom-scrollbar">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Concepts Covered
            </p>
            <div className="space-y-2">
              {result.conceptBreakdown.map((concept) => (
                <div key={concept.concept} className="flex justify-between items-center text-xs">
                  <span className="text-foreground truncate pr-2 w-full text-left" title={concept.concept}>
                    {concept.concept}
                  </span>
                  <span
                    className={cn(
                      "font-medium shrink-0",
                      concept.correct / concept.total >= 0.8
                        ? "text-success"
                        : concept.correct / concept.total >= 0.5
                        ? "text-warning"
                        : "text-destructive"
                    )}
                  >
                    {concept.correct}/{concept.total}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/quiz/review/" + result.attemptId)}
            className="cursor-pointer h-9 text-sm border-primary/30 text-primary hover:bg-primary/5"
          >
            Detailed Review
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/quiz/topic?stream=" + encodeURIComponent(streamParam))}
            className="cursor-pointer h-9 text-sm"
          >
            Mix New Topics
          </Button>
          <Button
            onClick={() => router.push("/dashboard")}
            size="sm"
            className="cursor-pointer h-9 text-sm glow hidden sm:flex"
          >
            Dashboard
          </Button>
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
            <span className="text-muted-foreground">/ {totalQuestions}</span>
          </span>
          {currentQuestion && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-secondary px-2 py-0.5 rounded-sm">
                {currentQuestion.topic}
              </span>
              <span
                className={cn(
                  "text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm font-medium",
                  currentQuestion.difficulty === 1
                    ? "bg-success/10 text-success"
                    : currentQuestion.difficulty === 2
                    ? "bg-success/20 text-success"
                    : currentQuestion.difficulty === 3
                    ? "bg-warning/10 text-warning"
                    : currentQuestion.difficulty === 4
                    ? "bg-destructive/10 text-destructive"
                    : "bg-destructive/20 text-destructive"
                )}
              >
                Lvl {currentQuestion.difficulty}
              </span>
            </div>
          )}
        </div>
        <ProgressBar
          value={(currentQuestionIndex / totalQuestions) * 100}
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
          className="rounded-xl border border-border bg-card p-5 elevated"
        >
          <h2 className="text-[15px] font-medium leading-relaxed mb-5">{currentQuestion?.text}</h2>

          <div className="space-y-2" role="radiogroup" aria-label="Answer options">
            {currentQuestion?.options.map((option) => (
              <QuizOption
                key={option.id}
                option={option}
                isSelected={selectedAnswer === option.id}
                isCorrect={null}
                isRevealed={false}
                correctOptionId={""}
                onSelect={selectAnswer}
                disabled={false}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Actions */}
      <div className="flex justify-between items-center">
        {/* Previous button */}
        <Button
          variant="outline"
          size="sm"
          onClick={prevQuestion}
          disabled={isFirstQuestion}
          className="cursor-pointer h-8 text-xs disabled:opacity-30"
          aria-label="Previous question"
        >
          <ArrowLeft className="mr-1 h-3 w-3" />
          Previous
        </Button>

        {/* Right side: hint + next/submit */}
        <div className="flex items-center gap-3">
          <p className="text-[11px] text-muted-foreground hidden sm:flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            Graded at end
          </p>
          <Button
            onClick={nextQuestion}
            disabled={!selectedAnswer}
            size="sm"
            className="cursor-pointer h-8 text-xs disabled:opacity-40"
            aria-label={isLastQuestion ? "Submit assessment" : "Next question"}
          >
            {isLastQuestion ? "Submit Assessment" : "Next Question"}
            <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Keyboard hint */}
      <p className="text-center text-[10px] text-muted-foreground/50 select-none">
        ← → to navigate · answers saved automatically
      </p>
    </div>
  );
}

export default function PlayQuizPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-[50vh]">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      }
    >
      <PlayQuizEngine />
    </Suspense>
  );
}
