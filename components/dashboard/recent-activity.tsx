"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { QuizAttempt } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, MinusCircle } from "lucide-react";

interface RecentActivityProps {
  attempts: QuizAttempt[];
}

function ScoreIndicator({ score }: { score: number }) {
  if (score >= 80) return <CheckCircle2 className="h-4 w-4 text-success shrink-0" />;
  if (score >= 60) return <MinusCircle className="h-4 w-4 text-warning shrink-0" />;
  return <XCircle className="h-4 w-4 text-destructive shrink-0" />;
}

export function RecentActivity({ attempts }: RecentActivityProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-foreground">Recent Activity</h2>
        <Link
          href="/profile"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          View all
        </Link>
      </div>

      <div className="border border-border rounded-lg bg-card divide-y divide-border">
        {attempts.slice(0, 5).map((attempt, index) => (
          <motion.div
            key={attempt.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-3 px-4 py-3"
          >
            <ScoreIndicator score={attempt.score} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground truncate">{attempt.quizTitle}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{attempt.date}</p>
            </div>
            <span className={cn(
              "text-xs font-medium tabular-nums shrink-0",
              attempt.score >= 80 ? "text-success" :
              attempt.score >= 60 ? "text-warning" : "text-destructive"
            )}>
              {attempt.score}%
            </span>
          </motion.div>
        ))}

        {attempts.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-xs text-muted-foreground">No activity yet. Start a quiz!</p>
          </div>
        )}
      </div>
    </section>
  );
}
