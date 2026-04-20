"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Zap, Brain, Calculator, Globe, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDailyQuizzes } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import Link from "next/link";

const CATEGORY_MAP: Record<string, { icon: any, color: string, label: string }> = {
  "current_affairs": { icon: Globe, color: "text-emerald-400", label: "Current Affairs" },
  "tech": { icon: Brain, color: "text-indigo-400", label: "Tech" },
  "aptitude": { icon: Zap, color: "text-amber-400", label: "Aptitude" },
  "maths": { icon: Calculator, color: "text-rose-400", label: "Maths" },
};

export function DailyQuizWidget() {
  const { data: dailyQuizzes, isLoading } = useQuery({
    queryKey: ['daily-quizzes'],
    queryFn: getDailyQuizzes,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-48 rounded-[32px] bg-card/20 animate-pulse border border-border/10" />
        ))}
      </div>
    );
  }

  // Convert object from backend to array of values
  const quizzes = dailyQuizzes ? Object.keys(dailyQuizzes).map(key => ({
    ...dailyQuizzes[key],
    type: key
  })) : [];

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between px-2">
        <div className="space-y-1">
          <h3 className="text-3xl font-black tracking-tighter text-foreground font-heading italic uppercase">Daily Quests</h3>
          <p className="text-[13px] text-muted-foreground font-bold tracking-tight opacity-40 uppercase tracking-[0.1em]">Complete to maintain streak & earn XP</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-[10px] font-black tracking-[0.1em] text-primary uppercase">New refresh in 14h</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quizzes.map((quiz, index) => {
          const config = CATEGORY_MAP[quiz.type] || { icon: Brain, color: "text-primary", label: quiz.type };
          const Icon = config.icon;
          const isBigQuest = quiz.questions?.length > 10;

          return (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              <Link href={`/quiz/daily/${quiz.id}`}>
                <div className={cn(
                  "h-full p-8 rounded-[32px] border border-border/40 bg-card/30 backdrop-blur-xl transition-all duration-500 overflow-hidden",
                  "hover:bg-card/50 hover:border-primary/30 hover:shadow-glow-primary/5 whisper-shadow group-hover:-translate-y-2",
                  isBigQuest && "ring-2 ring-primary/20 shadow-glow-primary/10"
                )}>
                  {/* Decorative Elements */}
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                  
                  <div className="relative z-10 flex flex-col h-full space-y-6">
                    <div className="flex items-start justify-between">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center border border-border/20 shadow-soft bg-background/50 transition-transform duration-700 group-hover:rotate-[10deg]",
                        config.color
                      )}>
                        <Icon className="h-7 w-7" />
                      </div>
                      
                      {isBigQuest && (
                        <div className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-black tracking-widest uppercase shadow-glow-primary">
                          Big Quest
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="text-xl font-black tracking-tighter text-foreground font-heading leading-tight mb-2">
                        {config.label}
                      </h4>
                      <p className="text-[12px] text-muted-foreground font-bold tracking-tight opacity-60">
                        {quiz.questions?.length || 0} Questions • {isBigQuest ? "100" : "50"} XP
                      </p>
                    </div>

                    <div className="mt-auto pt-4 flex items-center gap-2 text-primary text-[11px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                      Initiate <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
