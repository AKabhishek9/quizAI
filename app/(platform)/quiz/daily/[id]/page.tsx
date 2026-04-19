"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, RotateCcw, Trophy, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuizOption } from "@/components/quiz/quiz-option";
import { QuizTimer } from "@/components/quiz/quiz-timer";
import { DifficultyBadge } from "@/components/quiz/difficulty-badge";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { useQuiz } from "@/hooks/use-quiz";
import { useTimer } from "@/hooks/use-timer";
import { getDailyQuizById, submitDailyQuizSolution } from "@/lib/api-client";
import type { DailyQuiz } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function DailyQuizPlayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [quiz, setQuiz] = useState<DailyQuiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [streakUpdated, setStreakUpdated] = useState(false);

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
  } = useQuiz(quiz as any); // Type cast for reuse

  const currentQuestion = quiz?.questions[currentQuestionIndex] ?? null;
  const totalTime = quiz?.timePerQuestion ?? 30;

  const timer = useTimer(totalTime, () => {
    if (state === "playing" && !showFeedback) {
      submitAnswer();
    }
  });

  useEffect(() => {
    async function load() {
      try {
        const data = await getDailyQuizById(id);
        
        // Map backend schema to frontend typing for useQuiz hook
        const mappedQuiz = {
          ...data,
          title: `Daily ${data.category}`,
          questions: data.questions.map((q: any, idx: number) => ({
            id: q._id || `q-${idx}`,
            text: q.question,
            options: q.options.map((opt: string, optIdx: number) => ({
              id: optIdx.toString(),
              label: String.fromCharCode(65 + optIdx),
              text: opt
            })),
            correctOptionId: q.answer.toString(),
            explanation: q.explanation || `The correct answer is ${String.fromCharCode(65 + parseInt(q.answer))}.`,
            topic: q.topic || data.category
          })),
          questionCount: data.questions.length,
          timePerQuestion: data.timePerQuestion || 30,
          difficulty: "medium" as const
        };

        setQuiz(mappedQuiz as any);
      } catch (error) {
        console.error("Failed to load daily quiz:", error);
        toast.error("Failed to load daily quiz");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  useEffect(() => {
    if (state === "playing" && !showFeedback) {
      timer.reset(totalTime);
      timer.start();
    }
  }, [currentQuestionIndex, state, totalTime, timer, showFeedback]);

  useEffect(() => {
    if (showFeedback) timer.pause();
  }, [showFeedback, timer]);

  // Handle auto-submission when quiz ends
  useEffect(() => {
    if (state === "completed" && !streakUpdated && quiz) {
      const results = getResults();
      const answers = quiz.questions.map(q => ({
        questionId: q.id,
        selectedOptionId: results.score > 0 ? "dummy" : "skip" // We don't actually track every single answer in the backend submission yet, just the call
      }));

      const submit = async () => {
        setIsSubmitting(true);
        try {
          await submitDailyQuizSolution(id, {}); // Submission logic updates streak
          setStreakUpdated(true);
          toast.success("Daily Quest Complete!", {
            icon: <Flame className="h-4 w-4 text-orange-500" />
          });
        } catch (error) {
          console.error("Streak update failed:", error);
        } finally {
          setIsSubmitting(false);
        }
      };
      submit();
    }
  }, [state, streakUpdated, quiz, id, getResults]);

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
        <h2 className="text-lg font-semibold">Quest not found</h2>
        <p className="text-xs text-muted-foreground mt-1">
          This daily quest has expired or doesn&apos;t exist.
        </p>
        <Button
          onClick={() => router.push("/quiz")}
          size="sm"
          className="mt-4 cursor-pointer"
        >
          Back to library
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
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-8 text-muted-foreground hover:text-foreground -ml-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Trophy className="h-24 w-24" />
          </div>
          
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-bold uppercase tracking-wider mb-4 border border-orange-500/20">
            <Flame className="h-3 w-3 fill-current" />
            Daily Quest
          </div>
          
          <h1 className="text-2xl font-semibold tracking-tight mb-2">
            {quiz.category} Challenge
          </h1>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
            Complete this 10-question challenge to maintain your daily streak and earn bonus XP.
          </p>
          
          <div className="flex justify-center gap-8 text-xs text-muted-foreground mb-8">
            <div className="text-center">
              <p className="text-foreground font-semibold">10</p>
              <p>Questions</p>
            </div>
            <div className="text-center">
              <p className="text-foreground font-semibold">30s</p>
              <p>Timer</p>
            </div>
            <div className="text-center">
              <p className="text-foreground font-semibold">+{streakUpdated ? 0 : 50}</p>
              <p>XP Reward</p>
            </div>
          </div>

          <Button
            onClick={startQuiz}
            className="w-full cursor-pointer h-12 text-sm font-semibold shadow-lg shadow-primary/20"
          >
            Start Challenge
            <ArrowRight className="ml-2 h-4 w-4" />
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
        className="max-w-md mx-auto text-center py-12"
      >
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/5 text-primary">
            <Trophy className="h-8 w-8" />
          </div>

          <h2 className="text-xl font-semibold mb-1">Quest Complete!</h2>
          <div
            className={cn(
              "text-5xl font-bold tracking-tight mb-2",
              results.score >= 80 ? "text-success" : results.score >= 50 ? "text-warning" : "text-destructive"
            )}
          >
            {results.score}%
          </div>
          <p className="text-sm text-muted-foreground mb-8">
            You solved {results.correctAnswers} out of {quiz.questions.length} questions correctly.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-8 text-left">
            <div className="p-4 rounded-xl bg-secondary/30 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-xs font-medium">Daily Streak</span>
              </div>
              <p className="text-lg font-bold">Updated!</p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/30 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="text-xs font-medium">Rewards</span>
              </div>
              <p className="text-lg font-bold">+50 XP</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 cursor-pointer h-11"
              onClick={() => router.push("/quiz")}
            >
              Back to Library
            </Button>
            <Button
              className="flex-1 cursor-pointer h-11"
              onClick={() => router.push("/profile")}
            >
              View Profile
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  /* ── Playing ── */
  return (
    <div className="max-w-xl mx-auto space-y-6 py-4">
      {/* Top bar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-0.5">
              Daily Quest: {quiz.category}
            </span>
            <span className="text-xs font-medium tabular-nums">
              Question {currentQuestionIndex + 1} <span className="text-muted-foreground font-normal">of {quiz.questions.length}</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <QuizTimer timeRemaining={timer.timeRemaining} totalTime={totalTime} className="scale-90" />
          </div>
        </div>
        <ProgressBar
          value={((currentQuestionIndex + 1) / quiz.questions.length) * 100}
          showPercentage={false}
          size="sm"
          className="h-1.5"
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
          className="rounded-2xl border border-border bg-card p-6 shadow-sm min-h-[400px] flex flex-col"
        >
          <h2 className="text-lg font-medium leading-relaxed mb-8">
            {currentQuestion?.text}
          </h2>

          <div className="space-y-2.5 mt-auto" role="radiogroup" aria-label="Answer options">
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
                className="mt-6 p-4 rounded-xl bg-primary/[0.03] border border-primary/10"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    isCorrect ? "bg-success" : "bg-destructive"
                  )} />
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Explanation
                  </p>
                </div>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  {currentQuestion.explanation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {/* Actions */}
      <div className="flex justify-end pt-2">
        {!showFeedback ? (
          <Button
            onClick={submitAnswer}
            disabled={!selectedAnswer}
            size="lg"
            className="cursor-pointer px-10 h-11 text-sm font-semibold shadow-md disabled:opacity-40"
          >
            Submit Answer
          </Button>
        ) : (
          <Button
            onClick={nextQuestion}
            size="lg"
            disabled={isSubmitting}
            className="cursor-pointer px-10 h-11 text-sm font-semibold shadow-md"
          >
            {currentQuestionIndex < quiz.questions.length - 1
              ? "Next Question"
              : "Finish Quest"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
