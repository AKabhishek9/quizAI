"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";
import { DifficultyBadge } from "@/components/quiz/difficulty-badge";
import type { Quiz } from "@/lib/types";

interface QuizCardProps {
  quiz: Quiz;
  index?: number;
}

export function QuizCard({ quiz, index = 0 }: QuizCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
    >
      <Link href={`/quiz/${quiz.id}`} className="block h-full">
        <div className="group h-full rounded-lg border border-border bg-card p-5 flex flex-col gap-3 hover:border-primary/40 transition-colors cursor-pointer">
          <h3 className="text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors font-heading">
            {quiz.title}
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            <span className="self-start px-3 py-1 rounded-md bg-muted text-xs font-medium text-foreground">
              {quiz.category}
            </span>
            <DifficultyBadge difficulty={quiz.difficulty} />
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 flex-1">
            {quiz.description || `${quiz.title} quiz`}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
            <span>{quiz.questionCount} questions</span>
            <span>/</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              ~{Math.ceil((quiz.questionCount * quiz.timePerQuestion) / 60)} min
            </span>
          </div>

          <span className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground transition-colors group-hover:bg-primary/90">
            Take Quiz
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
