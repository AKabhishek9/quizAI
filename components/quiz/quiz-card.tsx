"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DifficultyBadge } from "./difficulty-badge";
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
      transition={{ delay: index * 0.05, duration: 0.35 }}
      className="group rounded-xl border border-border bg-card p-5 flex flex-col transition-shadow duration-200 hover:elevated cursor-pointer"
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          {quiz.category}
        </span>
        <DifficultyBadge difficulty={quiz.difficulty} />
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold mb-1.5 group-hover:text-primary transition-colors duration-150">
        {quiz.title}
      </h3>
      <p className="text-xs text-muted-foreground leading-relaxed mb-4 flex-1">
        {quiz.description}
      </p>

      {/* Meta */}
      <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-4">
        <span className="flex items-center gap-1">
          <BookOpen className="h-3 w-3" />
          {quiz.questionCount} questions
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {Math.round((quiz.questionCount * quiz.timePerQuestion) / 60)} min
        </span>
      </div>

      {/* CTA */}
      <Link href={`/quiz/${quiz.id}`} className="w-full">
        <Button
          variant="outline"
          size="sm"
          className="w-full cursor-pointer h-8 text-xs"
        >
          Start quiz
          <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </Link>
    </motion.div>
  );
}
