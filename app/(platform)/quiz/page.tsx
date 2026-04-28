"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Globe, Brain, Zap, Calculator, Clock, ArrowRight, Plus } from "lucide-react";
import { getDailyQuizzes } from "@/lib/api-client";

const CATEGORY_CONFIG: Record<string, { icon: any; color: string; gradient: string }> = {
  general_knowledge: { icon: Globe, color: "text-emerald-400", gradient: "from-emerald-500/10 to-emerald-500/5" },
  tech: { icon: Brain, color: "text-indigo-400", gradient: "from-indigo-500/10 to-indigo-500/5" },
  aptitude: { icon: Zap, color: "text-amber-400", gradient: "from-amber-500/10 to-amber-500/5" },
  maths: { icon: Calculator, color: "text-rose-400", gradient: "from-rose-500/10 to-rose-500/5" },
};

export default function QuizCatalogPage() {
  const router = useRouter();

  const { data: dailyQuizzes, isLoading } = useQuery({
    queryKey: ["daily-quizzes"],
    queryFn: getDailyQuizzes,
  });

  const quizzes = dailyQuizzes ? Object.entries(dailyQuizzes) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Daily Quests</h1>
          <p className="text-sm text-muted-foreground mt-1">Fresh challenges — refreshed every day at midnight</p>
        </div>
        <button
          onClick={() => router.push("/quiz/stream")}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Custom Quiz
        </button>
      </div>

      {/* Quiz Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 rounded-xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Clock className="h-10 w-10 text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold text-foreground">Daily quests are being prepared</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs">
            New quizzes are generated every day at midnight. Check back soon!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quizzes.map(([key, quiz], index) => {
            const config = CATEGORY_CONFIG[key] ?? { icon: Globe, color: "text-primary", gradient: "from-primary/10 to-primary/5" };
            const Icon = config.icon;
            return (
              <motion.button
                key={key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.07 }}
                onClick={() => router.push(`/quiz/daily/${key}`)}
                className={`w-full text-left rounded-xl border border-border bg-gradient-to-br ${config.gradient} p-5 hover:border-primary/40 transition-all group cursor-pointer`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className={`p-2.5 rounded-lg bg-background/60 ${config.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all mt-1" />
                </div>
                <div className="mt-4">
                  <h3 className="text-base font-semibold text-foreground">{quiz.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{quiz.description}</p>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-xs text-muted-foreground bg-background/60 px-2.5 py-1 rounded-md">
                    {quiz.questionCount} questions
                  </span>
                  <span className="text-xs text-muted-foreground">~{quiz.questionCount * 0.5} min</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}