"use client";

import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";
import { motion } from "framer-motion";

interface QuizTimerProps {
  timeRemaining: number;
  totalTime: number;
  className?: string;
}

export function QuizTimer({
  timeRemaining,
  totalTime,
  className,
}: QuizTimerProps) {
  const percentage = (timeRemaining / totalTime) * 100;
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  const isWarning = percentage <= 33 && percentage > 15;
  const isDanger = percentage <= 15;

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex items-center gap-1.5">
        <Clock
          className={cn(
            "h-3.5 w-3.5 transition-colors",
            isDanger
              ? "text-red-500"
              : isWarning
              ? "text-yellow-500"
              : "text-neutral-500 dark:text-neutral-400"
          )}
        />
        <span
          className={cn(
            "text-xs font-mono font-semibold tabular-nums transition-colors",
            isDanger
              ? "text-red-500"
              : isWarning
              ? "text-yellow-500"
              : "text-neutral-900 dark:text-neutral-100"
          )}
        >
          {minutes}:{seconds.toString().padStart(2, "0")}
        </span>
      </div>

      <div className="flex-1 h-1 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
        <motion.div
          className={cn(
            "h-full rounded-full transition-colors",
            isDanger
              ? "bg-red-500"
              : isWarning
              ? "bg-yellow-500"
              : "bg-indigo-600"
          )}
          initial={{ width: "100%" }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "linear" }}
        />
      </div>

      {isDanger && (
        <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
      )}
    </div>
  );
}
