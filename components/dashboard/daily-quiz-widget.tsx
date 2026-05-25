"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Zap, Brain, Calculator, Globe, ArrowRight, Clock } from "lucide-react";
import { getDailyQuizzes } from "@/lib/api-client";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";

const CATEGORY_MAP: Record<string, { icon: any; label: string }> = {
  general_knowledge: { icon: Globe, label: "General Knowledge" },
  tech: { icon: Brain, label: "Tech" },
  aptitude: { icon: Zap, label: "Aptitude" },
  maths: { icon: Calculator, label: "Maths" },
};

export function DailyQuizWidget() {
  const { data: dailyQuizzes, isLoading } = useQuery({
    queryKey: ["daily-quizzes"],
    queryFn: getDailyQuizzes,
  });

  const quizzes = useMemo(() => {
    return dailyQuizzes
      ? Object.keys(dailyQuizzes).map((key) => ({
          ...dailyQuizzes[key],
          type: key,
        }))
      : [];
  }, [dailyQuizzes]);

  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    if (!quizzes.length || !quizzes[0].expiresAt) return;

    const expiresAt = new Date(quizzes[0].expiresAt).getTime();
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = expiresAt - now;

      if (distance < 0) {
        setTimeLeft("Refreshing shortly...");
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`Refreshes in ${hours}h ${minutes}m`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [quizzes]);

  return (
    <section className="p-4 h-full flex flex-col glass-card">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse inline-block" />
          <h2 className="text-sm font-medium text-foreground font-heading">Daily Quests</h2>
        </div>
        {timeLeft && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-md border border-border/10">
            <Clock className="w-3.5 h-3.5" />
            <span>{timeLeft}</span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 flex-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 rounded-lg bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/20 bg-muted/20 p-6 text-center">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Daily quests are being generated. Check back soon.</p>
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
                <Link href={`/quiz/daily/${quiz.type}`}>
                  <div className="group flex flex-col gap-2 p-3 rounded-lg transition-all duration-200 cursor-pointer glass-card glass-card-hover border-border/10 bg-card/20 shadow-sm">
                    <div className="flex items-center justify-between">
                      <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <ArrowRight className="h-3 w-3 text-muted-foreground/40 group-hover:text-primary transition-colors group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground tracking-tight">{config.label}</p>
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
