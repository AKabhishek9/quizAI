"use client";

import { motion } from "framer-motion";
import { RotateCcw, Trophy, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LevelUpToast } from "@/components/shared/level-up-toast";
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
        className="max-w-2xl mx-auto text-center py-12"
      >
        <LevelUpToast
          show={showLevelToast}
          onClose={() => setShowLevelToast(false)}
          level={newLevel}
          xpGained={xpAwarded}
        />
        
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4">
          <div className={cn(
            "mb-4 mx-auto inline-flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400",
          )}>
            <Trophy className="h-5 w-5" />
          </div>

          <h2 className="text-base font-semibold mb-1">Quest Complete!</h2>
          <div
            className={cn(
              "text-4xl font-bold tracking-tight mb-1.5",
              accuracy >= 80 ? "text-success" : accuracy >= 50 ? "text-warning" : "text-destructive"
            )}
          >
            {accuracy}%
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            {correctCount} of {questionCount} correct
          </p>

          <div className="grid grid-cols-2 gap-2 mb-6">
            <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-1.5 mb-1 justify-center">
                <Flame className={cn("h-3.5 w-3.5", streakInfo?.currentStreak ? "text-orange-500" : "text-neutral-400")} />
                <span className="text-xs text-neutral-500 dark:text-neutral-400">Streak</span>
              </div>
              <p className="text-base font-semibold tabular-nums">
                {streakInfo ? `${streakInfo.currentStreak}d` : "-"}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-1.5 mb-1 justify-center">
                <Trophy className="h-3.5 w-3.5 text-neutral-400" />
                <span className="text-xs text-neutral-500 dark:text-neutral-400">Best</span>
              </div>
              <p className="text-base font-semibold tabular-nums">
                {streakInfo ? `${streakInfo.bestStreak}d` : "-"}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              className="flex-1 cursor-pointer h-9 px-4 py-2 text-sm font-medium rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700"
              onClick={() => router.push("/quiz")}
            >
              Library
            </Button>
            <Button
              className="flex-1 cursor-pointer h-9 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 border-0"
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
      className="max-w-2xl mx-auto text-center py-16"
    >
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4">
        <div
          className={cn(
            "text-4xl font-semibold tracking-tight mb-1",
            accuracy >= 80 ? "text-green-500" : accuracy >= 50 ? "text-yellow-500" : "text-red-500"
          )}
        >
          {accuracy}%
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-5">
          {correctCount} of {questionCount} correct
        </p>

        <div className="grid grid-cols-2 gap-2 mb-5">
          <div className="rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30 p-3">
            <p className="text-sm font-semibold text-green-600 dark:text-green-400 tabular-nums">{correctCount}</p>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Correct</p>
          </div>
          <div className="rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 p-3">
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">+{xpAwarded}</p>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">XP Earned</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => router.push("/quiz")}
            className="flex-1 cursor-pointer h-9 px-4 py-2 text-sm font-medium rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            More quizzes
          </Button>
          <Button
            onClick={() => router.push("/dashboard")}
            className="flex-1 cursor-pointer h-9 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 border-0"
          >
            Dashboard
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
