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
        
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className={cn(
            "mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-opacity-5",
            themeClass
          )}>
            <Trophy className="h-8 w-8" />
          </div>

          <h2 className="text-xl font-semibold mb-1">Quest Complete!</h2>
          <div
            className={cn(
              "text-5xl font-bold tracking-tight mb-2",
              accuracy >= 80 ? "text-success" : accuracy >= 50 ? "text-warning" : "text-destructive"
            )}
          >
            {accuracy}%
          </div>
          <p className="text-sm text-muted-foreground mb-8">
            You solved {correctCount} out of {questionCount} questions correctly.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-8 text-left">
            <div className="p-4 rounded-xl bg-secondary/30 border border-border relative overflow-hidden group">
              <div className="flex items-center gap-2 mb-1">
                <Flame className={cn("h-4 w-4", streakInfo?.currentStreak ? "text-orange-500" : "text-muted-foreground")} />
                <span className="text-xs font-medium">Daily Streak</span>
              </div>
              <p className="text-lg font-bold tabular-nums">
                {streakInfo ? `${streakInfo.currentStreak} Days` : "Loading..."}
              </p>
              {streakInfo?.currentStreak && (
                <div className="absolute top-0 right-0 p-2 opacity-5 scale-150 rotate-12 group-hover:rotate-0 transition-transform">
                  <Flame className="h-10 w-10 text-orange-500 fill-current" />
                </div>
              )}
            </div>
            <div className="p-4 rounded-xl bg-secondary/30 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="text-xs font-medium">Best Streak</span>
              </div>
              <p className="text-lg font-bold tabular-nums">
                {streakInfo ? `${streakInfo.bestStreak} Days` : "-"}
              </p>
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
              className={cn(
                "flex-1 cursor-pointer h-11",
                themeName === "indigo" && "bg-indigo-600 hover:bg-indigo-500 text-white",
                themeName === "emerald" && "bg-emerald-600 hover:bg-emerald-500 text-white",
                themeName === "amber" && "bg-amber-600 hover:bg-amber-500 text-white",
                themeName === "rose" && "bg-rose-600 hover:bg-rose-500 text-white"
              )}
              onClick={() => router.push("/profile")}
            >
              View Profile
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
      <div className="rounded-xl border border-border bg-card p-8">
        <LevelUpToast
          show={showLevelToast}
          onClose={() => setShowLevelToast(false)}
          level={newLevel}
          xpGained={xpAwarded}
        />

        <div
          className={cn(
            "text-5xl font-semibold tracking-tight mb-1",
            accuracy >= 80
              ? "text-success"
              : accuracy >= 50
              ? "text-warning"
              : "text-destructive"
          )}
        >
          {accuracy}%
        </div>
        <p className="text-xs text-muted-foreground mb-5">
          {correctCount} of {questionCount} correct
        </p>

        <div className="grid grid-cols-2 gap-2 mb-5">
          <div className="rounded-lg bg-success/[0.06] border border-success/10 p-3">
            <p className="text-base font-semibold text-success">{correctCount}</p>
            <p className="text-[11px] text-muted-foreground">Correct</p>
          </div>
          <div className="rounded-lg bg-secondary p-3">
            <p className="text-base font-semibold">+{xpAwarded}</p>
            <p className="text-[11px] text-muted-foreground">XP Earned</p>
          </div>
        </div>

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
