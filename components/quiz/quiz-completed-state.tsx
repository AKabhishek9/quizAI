"use client";

import { motion } from "framer-motion";
import { RotateCcw, Trophy, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LevelUpToast } from "@/components/shared/level-up-toast";
import { QuizCelebration } from "@/components/quiz/quiz-celebration";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface StreakInfo {
  currentStreak: number;
  bestStreak: number;
}

interface QuizCompletedStateProps {
  isDaily?: boolean;
  accuracy: number;
  correctCount: number;
  questionCount: number;
  xpAwarded?: number;
  newLevel?: number;
  showLevelToast: boolean;
  setShowLevelToast: (show: boolean) => void;
  streakInfo?: StreakInfo | null;
  themeClass?: string;
  themeName?: string;
}

export function QuizCompletedState({
  isDaily,
  accuracy,
  correctCount,
  questionCount,
  xpAwarded = 0,
  newLevel = 0,
  showLevelToast,
  setShowLevelToast,
  streakInfo,
  themeClass,
  themeName,
}: QuizCompletedStateProps) {
  const router = useRouter();

  if (isDaily) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative max-w-3xl mx-auto text-center py-12"
      >
        <LevelUpToast
          show={showLevelToast}
          onClose={() => setShowLevelToast(false)}
          level={newLevel}
          xpGained={xpAwarded}
        />
        <QuizCelebration show={accuracy >= 80} />

        <div className="card-base p-6">
          <div className="mb-4 mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Trophy className="h-5 w-5" />
          </div>

          <h2 className="font-heading text-base font-semibold mb-1">Quest Complete!</h2>
          <div
            className={cn(
              "stat-number text-4xl font-semibold tracking-tight mb-1.5",
              accuracy >= 80 ? "text-success" : accuracy >= 50 ? "text-warning" : "text-destructive"
            )}
          >
            {accuracy}%
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            {correctCount} of {questionCount} correct
          </p>

          <div className="grid grid-cols-2 gap-2 mb-6">
            <div className="p-3 rounded-lg bg-muted border border-border">
              <div className="flex items-center gap-1.5 mb-1 justify-center">
                <Flame className={cn("h-3.5 w-3.5", streakInfo?.currentStreak ? "text-warning" : "text-muted-foreground")} />
                <span className="text-xs text-muted-foreground">Streak</span>
              </div>
              <p className="stat-number text-base font-semibold">
                {streakInfo ? `${streakInfo.currentStreak}d` : "-"}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted border border-border">
              <div className="flex items-center gap-1.5 mb-1 justify-center">
                <Trophy className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Best</span>
              </div>
              <p className="stat-number text-base font-semibold">
                {streakInfo ? `${streakInfo.bestStreak}d` : "-"}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 cursor-pointer"
              onClick={() => router.push("/quiz")}
            >
              Library
            </Button>
            <Button
              className="flex-1 cursor-pointer"
              onClick={() => router.push("/profile")}
            >
              Profile
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-3xl mx-auto text-center py-16"
    >
      <div className="card-base p-6">
        <div
          className={cn(
            "stat-number text-4xl font-semibold tracking-tight mb-1",
                accuracy >= 80 ? "text-success" : accuracy >= 50 ? "text-warning" : "text-destructive"
          )}
        >
          {accuracy}%
        </div>
        <p className="text-xs text-muted-foreground mb-5">
          {correctCount} of {questionCount} correct
        </p>

        <div className="grid grid-cols-2 gap-2 mb-5">
          <div className="rounded-lg bg-success/10 border border-success/20 p-3">
            <p className="stat-number text-sm font-semibold text-success">{correctCount}</p>
            <p className="text-xs text-muted-foreground">Correct</p>
          </div>
          <div className="rounded-lg bg-muted border border-border p-3">
            <p className="stat-number text-sm font-semibold text-foreground">+{xpAwarded}</p>
            <p className="text-xs text-muted-foreground">XP Earned</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/quiz")}
            className="flex-1 cursor-pointer"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            More quizzes
          </Button>
          <Button
            onClick={() => router.push("/dashboard")}
            className="flex-1 cursor-pointer"
          >
            Dashboard
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
