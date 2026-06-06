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
        <div className="group flex h-full cursor-pointer flex-col gap-3 p-5 card-interactive">
          <h3 className="font-heading text-base font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
            {quiz.title}
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            <span className="self-start rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {quiz.category}
            </span>
            <DifficultyBadge difficulty={quiz.difficulty} />
          </div>

          <p className="line-clamp-2 flex-1 text-xs leading-relaxed text-muted-foreground">
            {quiz.description || `${quiz.title} quiz`}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
            <span>{quiz.questionCount} questions</span>
            <span className="text-border">·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              ~{Math.ceil((quiz.questionCount * quiz.timePerQuestion) / 60)} min
            </span>
          </div>

          <span className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors group-hover:bg-primary-hover">
            Take Quiz
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
