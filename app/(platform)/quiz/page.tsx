"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Globe, Brain, Zap, Calculator, Clock, ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDailyQuizzes } from "@/lib/api-client";

const CATEGORY_CONFIG: Record<string, { icon: any; color: string; gradient: string }> = {
  general_knowledge: { icon: Globe, color: "text-success", gradient: "from-success/10 to-success/5" },
  tech: { icon: Brain, color: "text-primary", gradient: "from-primary/10 to-primary/5" },
  aptitude: { icon: Zap, color: "text-warning", gradient: "from-warning/10 to-warning/5" },
  maths: { icon: Calculator, color: "text-destructive", gradient: "from-destructive/10 to-destructive/5" },
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
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">Daily Quests</h1>
          <p className="text-sm text-muted-foreground mt-1">Fresh challenges refreshed every day at midnight</p>
        </div>
        <Button onClick={() => router.push("/quiz/stream")} className="w-full sm:w-auto cursor-pointer">
          <Plus className="h-4 w-4" />
          Custom Quiz
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 rounded-xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-dashed border-border bg-card px-4">
          <Clock className="h-10 w-10 text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold text-foreground font-heading">Daily quests are being prepared</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs">
            New quizzes are generated every day at midnight. Next refresh in {refreshCountdown}.
          </p>
          <Button onClick={() => router.push("/quiz/stream")} size="sm" className="mt-5 cursor-pointer">
            Build a Custom Quiz
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quizzes.map(([key, quiz], index) => {
            const config = CATEGORY_CONFIG[key] ?? { icon: Globe, color: "text-primary", gradient: "from-primary/10 to-primary/5" };
            const Icon = config.icon;
            return (
              <motion.button
                key={key}
                type="button"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.07 }}
                onClick={() => router.push(`/quiz/daily/${key}`)}
                className="w-full text-left p-5 group cursor-pointer card-interactive"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className={`p-2.5 rounded-lg bg-card/45 border border-border/20 ${config.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all mt-1" />
                </div>
                <div className="mt-4">
                  <h3 className="text-base font-semibold text-foreground leading-tight">{quiz.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{quiz.description}</p>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-foreground bg-card/35 px-2.5 py-1 rounded-md border border-border/25">
                    {quiz.questionCount} questions
                  </span>
                  <span className="text-xs font-semibold text-success bg-success/15 px-2.5 py-1 rounded-md border border-success/20">
                    +50–100 XP
                  </span>
                  <span className="text-xs font-semibold text-warning bg-warning/15 px-2.5 py-1 rounded-md border border-warning/20">
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
