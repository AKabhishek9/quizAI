"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { QuizAttempt } from "@/lib/types";
import { DifficultyBadge } from "@/components/quiz/difficulty-badge";
import { cn } from "@/lib/utils";

interface RecentActivityProps {
  attempts: QuizAttempt[];
}

export function RecentActivity({ attempts }: RecentActivityProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold">Recent activity</h3>
        <Link
          href="/profile"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          View all
        </Link>
      </div>

      <div className="space-y-1">
        {attempts.slice(0, 5).map((attempt, index) => (
          <motion.div
            key={attempt.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.04, duration: 0.25 }}
            className="flex items-center justify-between py-2.5 px-2 -mx-2 rounded-md hover:bg-secondary/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span
                className={cn(
                  "text-xs font-semibold tabular-nums w-8 text-center",
                  attempt.score >= 80
                    ? "text-success"
                    : attempt.score >= 50
                    ? "text-warning"
                    : "text-destructive"
                )}
              >
                {attempt.score}%
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-medium truncate">
                  {attempt.quizTitle}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {attempt.date}
                </p>
              </div>
            </div>
            <DifficultyBadge difficulty={attempt.difficulty} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
