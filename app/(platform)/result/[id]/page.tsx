"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, RotateCcw, Check, X, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DifficultyBadge } from "@/components/quiz/difficulty-badge";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { getUserDashboard, getQuizAttemptById } from "@/lib/api";
import type { QuizAttempt } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        if (id === "latest") {
          const { history } = await getUserDashboard();
          setAttempt(history[0] ?? null);
        } else {
          const data = await getQuizAttemptById(id);
          setAttempt(data as unknown as QuizAttempt);
        }
      } catch (err) {
        console.error("Failed to load result:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="text-center py-20">
        <h2 className="text-lg font-semibold">No results yet</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Complete a quiz to see results.
        </p>
        <Button
          size="sm"
          onClick={() => router.push("/quiz")}
          className="mt-4 cursor-pointer"
        >
          Browse quizzes
        </Button>
      </div>
    );
  }

  const scoreColor =
    attempt.score >= 80
      ? "text-success"
      : attempt.score >= 50
      ? "text-warning"
      : "text-destructive";

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Score */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-card p-7 text-center"
      >
        <DifficultyBadge difficulty={attempt.difficulty} className="mb-3" />
        <p className="text-sm font-medium mb-4 text-muted-foreground">
          {attempt.quizTitle}
        </p>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className={cn("text-5xl font-semibold tracking-tight mb-1", scoreColor)}
        >
          {attempt.score}%
        </motion.div>
        <p className="text-xs text-muted-foreground mb-6">
          {attempt.correctAnswers} of {attempt.totalQuestions} correct
        </p>

        {/* Breakdown */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <div className="rounded-lg bg-success/[0.06] border border-success/10 p-3 text-center">
            <Check className="h-3.5 w-3.5 text-success mx-auto mb-1" />
            <p className="text-base font-semibold text-success">{attempt.correctAnswers}</p>
            <p className="text-[11px] text-muted-foreground">Correct</p>
          </div>
          <div className="rounded-lg bg-destructive/[0.06] border border-destructive/10 p-3 text-center">
            <X className="h-3.5 w-3.5 text-destructive mx-auto mb-1" />
            <p className="text-base font-semibold text-destructive">{attempt.incorrectAnswers}</p>
            <p className="text-[11px] text-muted-foreground">Wrong</p>
          </div>
          <div className="rounded-lg bg-secondary p-3 text-center">
            <Minus className="h-3.5 w-3.5 text-muted-foreground mx-auto mb-1" />
            <p className="text-base font-semibold">{attempt.skippedAnswers}</p>
            <p className="text-[11px] text-muted-foreground">Skipped</p>
          </div>
        </div>

        <ProgressBar
          value={attempt.score}
          label="Score"
          color={
            attempt.score >= 80
              ? "success"
              : attempt.score >= 50
              ? "warning"
              : "destructive"
          }
          size="sm"
        />
      </motion.div>

      {/* Weak areas */}
      {attempt.weakTopics.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-5"
        >
          <h3 className="text-sm font-semibold mb-3">Areas to improve</h3>
          <div className="flex flex-wrap gap-1.5">
            {attempt.weakTopics.map((topic) => (
              <span
                key={topic}
                className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-secondary text-muted-foreground"
              >
                {topic}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-border bg-card p-5"
      >
        <h3 className="text-sm font-semibold mb-3">Summary</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Time", value: `${Math.floor(attempt.timeTaken / 60)}m ${attempt.timeTaken % 60}s` },
            { label: "Date", value: attempt.date },
            { label: "Category", value: attempt.category },
            { label: "Questions", value: String(attempt.totalQuestions) },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-[11px] text-muted-foreground">{item.label}</p>
              <p className="text-xs font-medium">{item.value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex gap-2 justify-center pt-2 pb-8"
      >
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
          <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </motion.div>
    </div>
  );
}
