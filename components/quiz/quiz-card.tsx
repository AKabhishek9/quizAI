"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Quiz } from "@/lib/types";

interface QuizCardProps {
  quiz: Quiz;
  index?: number;
}

export function QuizCard({ quiz, index = 0 }: QuizCardProps) {
  // Simulate completion status — in production this would come from attempt data
  const isCompleted = Math.random() > 0.5; // placeholder
  const score = isCompleted ? Math.floor(Math.random() * 40 + 60) : Math.floor(Math.random() * 50 + 30);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
    >
      <Link href={`/quiz/${quiz.id}`} className="block h-full">
        <div className="group h-full rounded-lg border border-border bg-card p-5 flex flex-col gap-3 hover:border-primary/40 transition-colors cursor-pointer">
          {/* Title */}
          <h3 className="text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
            {quiz.title}
          </h3>

          {/* Category badge */}
          <span className="self-start px-3 py-1 rounded-md bg-muted text-xs font-medium text-foreground">
            {quiz.category}
          </span>

          {/* Description */}
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 flex-1">
            {quiz.description || `${quiz.title} quiz`}
          </p>

          {/* Bottom row: Status/Score + Action button */}
          <div className="flex items-center justify-between pt-1">
            {isCompleted ? (
              <span className="text-sm font-semibold text-emerald-500">Completed</span>
            ) : (
              <span className="text-lg font-bold text-foreground tabular-nums">{score}%</span>
            )}

            <span
              className="px-4 py-1.5 rounded-md text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {isCompleted ? "Retake" : "Take Quiz"}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
