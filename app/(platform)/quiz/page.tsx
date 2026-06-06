"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Globe, Brain, Zap, Calculator, Clock, ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDailyQuizzes } from "@/lib/api-client";

const CATEGORY_CONFIG: Record<string, { icon: any; chip: string }> = {
  general_knowledge: { icon: Globe, chip: "bg-success/15 text-success" },
  tech: { icon: Brain, chip: "bg-primary/15 text-primary" },
  aptitude: { icon: Zap, chip: "bg-warning/15 text-warning" },
  maths: { icon: Calculator, chip: "bg-destructive/15 text-destructive" },
};

function getTimeUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const distance = midnight.getTime() - now.getTime();
  const hours = Math.floor(distance / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

export default function QuizCatalogPage() {
  const router = useRouter();
  const [refreshCountdown, setRefreshCountdown] = useState("");

  const { data: dailyQuizzes, isLoading } = useQuery({
    queryKey: ["daily-quizzes"],
    queryFn: getDailyQuizzes,
  });

  useEffect(() => {
    const update = () => setRefreshCountdown(getTimeUntilMidnight());
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  const quizzes = dailyQuizzes ? Object.entries(dailyQuizzes) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Daily Quests</h1>
          <p className="text-sm text-muted-foreground mt-1">Fresh challenges refreshed every day at midnight</p>
        </div>
        <Button onClick={() => router.push("/quiz/stream")} className="w-full sm:w-auto cursor-pointer">
          <Plus className="h-4 w-4" />
          Custom Quiz
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <div className="card-base flex flex-col items-center justify-center py-16 text-center border-dashed px-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground mb-4">
            <Clock className="h-6 w-6" />
          </div>
          <h2 className="font-heading text-base font-medium text-foreground">Daily quests are being prepared</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs">
            New quizzes are generated every day at midnight. Next refresh in {refreshCountdown}.
          </p>
          <Button onClick={() => router.push("/quiz/stream")} size="sm" className="mt-5 cursor-pointer">
            Build a Custom Quiz
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map(([key, quiz], index) => {
            const config = CATEGORY_CONFIG[key] ?? { icon: Globe, chip: "bg-primary/15 text-primary" };
            const Icon = config.icon;
            return (
              <motion.button
                key={key}
                type="button"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.07 }}
                onClick={() => router.push(`/quiz/daily/${key}`)}
                className="card-interactive w-full text-left p-5 group cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${config.chip}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all mt-1" />
                </div>
                <div className="mt-4 min-w-0">
                  <h3 className="text-base font-semibold text-foreground leading-tight truncate">{quiz.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{quiz.description}</p>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-foreground bg-muted px-2.5 py-1 rounded-lg">
                    {quiz.questionCount} questions
                  </span>
                  <span className="text-xs font-medium text-success bg-success/15 px-2.5 py-1 rounded-lg">
                    +50–100 XP
                  </span>
                  <span className="text-xs font-medium text-warning bg-warning/15 px-2.5 py-1 rounded-lg">
                    Mixed
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    ~{Math.ceil(quiz.questionCount * 0.5)} min
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
