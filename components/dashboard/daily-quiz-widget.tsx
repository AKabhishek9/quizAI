"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Zap, Brain, Calculator, Globe, ArrowRight } from "lucide-react";
import { getDailyQuizzes } from "@/lib/api-client";
import Link from "next/link";

const CATEGORY_MAP: Record<string, { icon: any; label: string }> = {
  current_affairs: { icon: Globe, label: "Current Affairs" },
  tech: { icon: Brain, label: "Tech" },
  aptitude: { icon: Zap, label: "Aptitude" },
  maths: { icon: Calculator, label: "Maths" },
};

export function DailyQuizWidget() {
  const { data: dailyQuizzes, isLoading } = useQuery({
    queryKey: ["daily-quizzes"],
    queryFn: getDailyQuizzes,
  });

  const quizzes = dailyQuizzes
    ? Object.keys(dailyQuizzes).map((key) => ({
        ...dailyQuizzes[key],
        type: key,
      }))
    : [];

  return (
    <section className="border border-border rounded-lg bg-card p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse inline-block" />
        <h2 className="text-sm font-medium text-foreground">Daily Quests</h2>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 flex-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 rounded-lg bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-muted-foreground text-center">Daily quests are being generated. Check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 flex-1">
          {quizzes.map((quiz, index) => {
            const config = CATEGORY_MAP[quiz.type] ?? { icon: Brain, label: quiz.type };
            const Icon = config.icon;
            return (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/quiz/daily/${quiz.id}`}>
                  <div className="group flex flex-col gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors duration-150 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <ArrowRight className="h-3 w-3 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{config.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {quiz.questions?.length || 10} questions
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}
