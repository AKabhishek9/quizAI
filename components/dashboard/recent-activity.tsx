"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { QuizAttempt } from "@/lib/types";
import { DifficultyBadge } from "@/components/quiz/difficulty-badge";
import { cn } from "@/lib/utils";

interface RecentActivityProps {
  attempts: QuizAttempt[];
}

const statusColors = (score: number) => {
  if (score >= 80) return "bg-emerald-500 text-white";
  if (score >= 60) return "bg-amber-500 text-white";
  return "bg-rose-500 text-white";
};

const iconMapping = (category: string = "") => {
  const cat = category.toLowerCase();
  if (cat.includes("react")) return "layers";
  if (cat.includes("css") || cat.includes("layout")) return "palette";
  if (cat.includes("js") || cat.includes("script")) return "javascript";
  if (cat.includes("ts") || cat.includes("type")) return "code";
  return "terminal";
};

export function RecentActivity({ attempts }: RecentActivityProps) {
  return (
    <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950/20 p-8 shadow-sm h-full">
      <div className="flex items-center justify-between mb-10">
        <h3 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Recent Activity</h3>
        <Link
          href="/profile"
          className="text-sm font-semibold text-primary hover:underline transition-all"
        >
          View all
        </Link>
      </div>

      <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-100 dark:before:from-slate-800 before:via-slate-100 dark:before:via-slate-800 before:to-transparent">
        {attempts.slice(0, 4).map((attempt, index) => (
          <motion.div
            key={attempt.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative flex items-center justify-between group"
          >
            <div className="flex items-center w-full">
              {/* Timeline dot/icon */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:scale-110 group-hover:text-primary transition-all z-10 shadow-sm overflow-hidden">
                <span className="material-symbols-outlined text-[18px]">
                  {iconMapping(attempt.quizTitle)}
                </span>
              </div>

              {/* Content */}
              <div className="ml-4 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[14px] font-semibold text-slate-700 dark:text-slate-200 truncate group-hover:text-primary transition-colors">
                    {attempt.quizTitle}
                  </p>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight shrink-0",
                    statusColors(attempt.score)
                  )}>
                    {attempt.score}%
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {attempt.date}
                  </span>
                  <span className="text-[10px] py-0.5 px-2 rounded-md bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700 font-bold uppercase tracking-wider">
                    {attempt.difficulty}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
