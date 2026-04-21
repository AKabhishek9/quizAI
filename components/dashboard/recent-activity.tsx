"use client";

import { motion } from "framer-motion";
import type { QuizAttempt } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RecentActivityProps {
  attempts: QuizAttempt[];
}

// Deterministic colour from a string — cycles through a set of tailwind colours
const COLOURS = [
  "bg-violet-500",
  "bg-rose-500",
  "bg-sky-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-pink-500",
  "bg-indigo-500",
];

function dotColour(title: string) {
  let h = 0;
  for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) >>> 0;
  return COLOURS[h % COLOURS.length];
}

function statusLabel(score: number) {
  if (score >= 80) return "Completed quiz";
  if (score >= 50) return "Mixed";
  return "Incomplete";
}

export function RecentActivity({ attempts }: RecentActivityProps) {
  return (
    <section className="border border-border rounded-lg bg-card p-4 flex flex-col gap-1">
      <h2 className="text-sm font-medium text-foreground mb-2">Recent Activity</h2>

      {attempts.length === 0 && (
        <div className="flex-1 flex items-center justify-center py-8">
          <p className="text-xs text-muted-foreground text-center">
            No activity yet.<br />Start a quiz to see it here.
          </p>
        </div>
      )}

      {attempts.slice(0, 5).map((attempt, index) => {
        const colour = dotColour(attempt.quizTitle);
        const status = statusLabel(attempt.score);
        return (
          <motion.div
            key={attempt.id}
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-3 py-2 border-b border-border last:border-0"
          >
            {/* Coloured icon square */}
            <div
              className={cn(
                "h-8 w-8 rounded-md shrink-0 flex items-center justify-center text-white text-[10px] font-bold",
                colour
              )}
            >
              {attempt.quizTitle.slice(0, 1).toUpperCase()}
            </div>

            {/* Title + status */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate leading-tight">
                {attempt.quizTitle}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{status}</p>
            </div>
          </motion.div>
        );
      })}
    </section>
  );
}
