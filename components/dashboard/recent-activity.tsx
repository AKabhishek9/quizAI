"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { formatDistanceToNowStrict } from "date-fns";
import type { QuizAttempt } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RecentActivityProps {
  attempts: QuizAttempt[];
}

function statusLabel(score: number) {
  if (score >= 80) return "Completed";
  if (score >= 50) return "Mixed";
  return "Incomplete";
}

function scoreColour(score: number) {
  if (score >= 80) return "text-success";
  if (score >= 50) return "text-primary";
  return "text-muted-foreground";
}

function relativeTime(dateStr: string) {
  try {
    return formatDistanceToNowStrict(new Date(dateStr), { addSuffix: true });
  } catch {
    return "";
  }
}

export function RecentActivity({ attempts }: RecentActivityProps) {
  return (
    <section className="p-3 flex flex-col card-base h-full">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium text-foreground font-heading">Recent Activity</h2>
        <Link
          href="/profile"
          className="text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          View all
        </Link>
      </div>

      {attempts.length === 0 && (
        <div className="flex-1 flex items-center justify-center py-6">
          <p className="text-xs text-muted-foreground text-center">
            No activity yet.<br />Start a quiz to see it here.
          </p>
        </div>
      )}

      <ul className="flex flex-col">
        {attempts.slice(0, 5).map((attempt, index) => {
          const status = statusLabel(attempt.score);
          const time = relativeTime(attempt.date);
          return (
            <motion.li
              key={attempt.id}
              initial={{ opacity: 0, x: 4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04 }}
              className="flex items-center gap-2.5 border-b border-border/60 py-1.5 last:border-0"
            >
              <div
                aria-hidden="true"
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-[10px] font-bold text-foreground"
              >
                {attempt.quizTitle.slice(0, 1).toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium leading-tight text-foreground" title={attempt.quizTitle}>
                  {attempt.quizTitle}
                </p>
                <p className="text-[10px] text-muted-foreground leading-none mt-0.5">{status}</p>
              </div>

              <div className="shrink-0 text-right">
                <span className={cn("text-xs font-semibold tabular-nums block leading-tight", scoreColour(attempt.score))}>
                  {attempt.score}%
                </span>
                {time && (
                  <span className="text-[9px] text-muted-foreground/70 leading-none">{time}</span>
                )}
              </div>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
