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
        className="max-w-md mx-auto text-center py-12"
      >
        <LevelUpToast
          show={showLevelToast}
          onClose={() => setShowLevelToast(false)}
          level={newLevel}
          xpGained={xpAwarded}
        />
        
        <div className="rounded-lg border border-border bg-card p-6">
          <div className={cn(
            "mb-5 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary",
          )}>
            <Trophy className="h-6 w-6" />
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

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center gap-1.5 mb-1">
                <Flame className={cn("h-3.5 w-3.5", streakInfo?.currentStreak ? "text-orange-500" : "text-muted-foreground")} />
                <span className="text-xs text-muted-foreground">Streak</span>
              </div>
              <p className="text-base font-semibold tabular-nums">
                {streakInfo ? `${streakInfo.currentStreak}d` : "-"}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center gap-1.5 mb-1">
                <Trophy className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Best</span>
              </div>
              <p className="text-base font-semibold tabular-nums">
                {streakInfo ? `${streakInfo.bestStreak}d` : "-"}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 cursor-pointer h-8 text-sm"
              onClick={() => router.push("/quiz")}
            >
              Library
            </Button>
            <Button
              className="flex-1 cursor-pointer h-8 text-sm"
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
      className="max-w-md mx-auto text-center py-16"
    >
      <div className="rounded-lg border border-border bg-card p-6">
        <div
          className={cn(
            "text-4xl font-semibold tracking-tight mb-1",
            accuracy >= 80 ? "text-success" : accuracy >= 50 ? "text-warning" : "text-destructive"
          )}
        >
          {accuracy}%
        </div>
        <p className="text-xs text-muted-foreground mb-5">
          {correctCount} of {questionCount} correct
        </p>

        <div className="grid grid-cols-2 gap-2 mb-5">
          <div className="rounded-lg bg-success/[0.06] border border-success/10 p-3">
            <p className="text-sm font-semibold text-success tabular-nums">{correctCount}</p>
            <p className="text-[11px] text-muted-foreground">Correct</p>
          </div>
          <div className="rounded-lg bg-muted/50 border border-border p-3">
            <p className="text-sm font-semibold tabular-nums">+{xpAwarded}</p>
            <p className="text-[11px] text-muted-foreground">XP Earned</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/quiz")}
            className="cursor-pointer h-8 text-xs flex-1"
          >
            <RotateCcw className="mr-1 h-3 w-3" />
            More quizzes
          </Button>
          <Button
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="cursor-pointer h-8 text-xs flex-1"
          >
            Dashboard
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
