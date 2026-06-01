"use client";

import { useEffect, useState, Suspense, useMemo, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, AlertCircle, Loader2, TrendingUp, TrendingDown, Minus, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuizOption } from "@/components/quiz/quiz-option";
import { QuizTimer } from "@/components/quiz/quiz-timer";
import { AdaptiveContextLabel } from "@/components/quiz/adaptive-context-label";
import { QuizCelebration } from "@/components/quiz/quiz-celebration";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { useAdaptiveQuiz } from "@/hooks/use-adaptive-quiz";
import { useTimer } from "@/hooks/use-timer";
import type { DifficultyLabel } from "@/hooks/use-adaptive-quiz";
import { cn } from "@/lib/utils";

const ADAPTIVE_TIMER_SECONDS = 90;

/** Animated count-up for a final number (e.g. accuracy). Respects reduced motion. */
function CountUp({ value, suffix = "", durationMs = 600 }: { value: number; suffix?: string; durationMs?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    let start = 0;
    const tick = (t: number) => {
      if (!start) start = t;
      const progress = Math.min(1, (t - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, durationMs]);
  return (
    <span className="tabular-nums">
      {display}
      {suffix}
    </span>
  );
}

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
  const {
    timeRemaining,
    isExpired: isTimerExpired,
    resetAndStart: resetAndStartTimer,
    pause: pauseQuestionTimer,
  } = useTimer(ADAPTIVE_TIMER_SECONDS);

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

  useEffect(() => {
    if (state !== "playing") {
      pauseQuestionTimer();
      return;
    }

    resetAndStartTimer(ADAPTIVE_TIMER_SECONDS);
  }, [currentQuestionIndex, state, pauseQuestionTimer, resetAndStartTimer]);

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
    const steps = [
      "Analyzing your performance",
      "Selecting weak concepts",
      "Building your questions",
    ];
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
          <h3 className="text-lg font-medium tracking-tight mb-1 font-heading">
            {isGenerating ? "Generating your quiz" : "Analyzing your results"}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {isGenerating
              ? "Tailoring questions to your level. This can take up to 30 seconds."
              : "Calculating your adaptive metrics…"}
          </p>
        </div>

        {isGenerating && (
          <div className="w-full max-w-[16rem] space-y-2 text-left">
            {steps.map((step, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.2, duration: 0.4 }}
                className="flex items-center gap-2.5"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span className="text-xs text-muted-foreground">{step}</span>
              </motion.div>
            ))}
            <p className="pt-1 text-[11px] font-mono text-primary/70 tabular-nums">
              {elapsed}s elapsed…
            </p>
          </div>
        )}
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
          <h2 className="text-base font-semibold text-foreground mb-1 font-heading">Failed to load quiz</h2>
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
              className="cursor-pointer h-8 text-xs"
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
        className="relative max-w-3xl mx-auto py-10 space-y-6"
      >
        <QuizCelebration show={result.accuracy >= 80} />

        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight font-heading">Assessment Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            We have analyzed your performance across {topicsArray.length} topics.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
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
              <CountUp value={result.accuracy} suffix="%" />
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
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-medium tabular-nums shrink-0">
            Question {currentQuestionIndex + 1}{" "}
            <span className="text-muted-foreground">/ {totalQuestions}</span>
          </span>
          <QuizTimer
            timeRemaining={timeRemaining}
            totalTime={ADAPTIVE_TIMER_SECONDS}
            className="w-24 sm:w-32 shrink-0"
          />
        </div>
        {currentQuestion && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-secondary px-2 py-0.5 rounded-sm max-w-full truncate">
              {currentQuestion.topic}
            </span>
            <span
              className={cn(
                "text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm font-medium shrink-0",
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
        <ProgressBar
          value={(currentQuestionIndex / totalQuestions) * 100}
          showPercentage={false}
          size="sm"
        />
      </div>

      {/* Grading Notice */}
      <div className="bg-muted/30 border border-border/50 rounded-lg p-3 text-center text-xs text-muted-foreground shadow-sm">
        This quiz is graded at the end. Select your best answer and continue.
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
          {currentQuestion?.topic && (
            <div className="mb-4">
              <AdaptiveContextLabel topic={currentQuestion.topic} />
            </div>
          )}
          <h2 className="text-[15px] font-medium leading-relaxed mb-5 font-heading">{currentQuestion?.text}</h2>

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
                disabled={isTimerExpired}
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
          className="cursor-pointer h-8 text-xs disabled:opacity-30 gap-1.5"
          aria-label="Previous question"
        >
          <ArrowLeft className="h-3 w-3" />
          Previous
          <kbd className="hidden sm:inline-flex ml-1 items-center justify-center rounded border border-border bg-muted/50 px-1 font-sans text-[10px] font-medium text-muted-foreground shadow-sm">Left</kbd>
        </Button>

        {/* Right side: hint + next/submit */}
        <div className="flex items-center gap-3">
          <Button
            onClick={nextQuestion}
            disabled={!selectedAnswer || isTimerExpired}
            size="sm"
            className="cursor-pointer h-8 text-xs disabled:opacity-40 gap-1.5"
            aria-label={isLastQuestion ? "Submit assessment" : "Next question"}
          >
            {isTimerExpired
              ? "Time's up!"
              : isLastQuestion
              ? "Submit Assessment"
              : "Next Question"}
            <ArrowRight className="h-3 w-3" />
            {!isLastQuestion && !isTimerExpired && (
              <kbd className="hidden sm:inline-flex ml-1 items-center justify-center rounded border border-primary-foreground/20 bg-primary-foreground/10 px-1 font-sans text-[10px] font-medium text-primary-foreground/80 shadow-sm">Right</kbd>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function QuizErrorState({ onRetry }: { onRetry: () => void }) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto text-center py-16"
    >
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
        <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-3" />
        <h2 className="text-base font-semibold text-foreground mb-1 font-heading">Quiz player crashed</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Something unexpected happened while rendering this assessment.
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
            onClick={onRetry}
            size="sm"
            className="cursor-pointer h-8 text-xs"
          >
            Retry
          </Button>
        </div>
      </div>
    </motion.div>
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
      <ErrorBoundary fallback={({ reset }) => <QuizErrorState onRetry={reset} />}>
        <PlayQuizEngine />
      </ErrorBoundary>
    </Suspense>
  );
}
