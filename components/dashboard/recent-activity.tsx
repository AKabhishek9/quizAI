"use client";

import { motion } from "framer-motion";
import type { QuizAttempt } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RecentActivityProps {
  attempts: QuizAttempt[];
}

function statusLabel(score: number) {
  if (score >= 80) return "Completed quiz";
  if (score >= 50) return "Mixed";
  return "Incomplete";
}

function scoreColour(score: number) {
  if (score >= 80) return "text-success";
  if (score >= 50) return "text-primary";
  return "text-muted-foreground";
}

export function RecentActivity({ attempts }: RecentActivityProps) {
  return (
    <section className="p-4 flex flex-col gap-1 card-base">
      <h2 className="text-sm font-medium text-foreground mb-2 font-heading">Recent Activity</h2>

      {attempts.length === 0 && (
        <div className="flex-1 flex items-center justify-center py-8">
          <p className="text-xs text-muted-foreground text-center">
            No activity yet.<br />Start a quiz to see it here.
          </p>
        </div>
      )}

      <ul className="flex flex-col">
        {attempts.slice(0, 5).map((attempt, index) => {
          const status = statusLabel(attempt.score);
          return (
            <motion.li
              key={attempt.id}
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3 border-b border-border py-2 last:border-0"
            >
              {/* Neutral icon square — decorative; title is shown as text */}
              <div
                aria-hidden="true"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-[11px] font-bold text-foreground"
              >
                {attempt.quizTitle.slice(0, 1).toUpperCase()}
              </div>

              {/* Title + status */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium leading-tight text-foreground" title={attempt.quizTitle}>
                  {attempt.quizTitle}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{status}</p>
              </div>

              {/* Score */}
              <span className={cn("shrink-0 text-sm font-semibold tabular-nums", scoreColour(attempt.score))}>
                {attempt.score}%
              </span>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
