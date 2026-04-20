"use client";

import { motion } from "framer-motion";
import { Target, Sparkles, Terminal, Monitor, Zap } from "lucide-react";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { cn } from "@/lib/utils";

interface SkillEquilibriumProps {
  stats: {
    averageScore: number;
    categoryPerformance: Array<{
      category: string;
      percentage: number;
    }>;
  };
}

export function SkillEquilibrium({ stats }: SkillEquilibriumProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="rounded-[40px] border border-border/40 bg-card/30 p-12 whisper-shadow backdrop-blur-xl group hover:bg-card/40 transition-colors"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-16">
        <div className="space-y-4">
          <div className="w-16 h-16 rounded-[24px] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-soft">
            <Target className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-3xl font-black tracking-tighter text-foreground font-heading uppercase italic group-hover:not-italic transition-all leading-none">Skill Equilibrium</h3>
            <p className="text-[15px] text-muted-foreground font-bold tracking-tight opacity-60 uppercase tracking-[0.05em]">Deep-learning telemetry of conceptual mastery</p>
          </div>
        </div>
        <div className="text-left md:text-right space-y-1">
          <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.25em] leading-none mb-3">Composite Mastery Index</p>
          <div className="flex items-center justify-start md:justify-end gap-3 text-7xl font-black text-primary font-heading tracking-tighter">
            {stats.averageScore}<span className="text-3xl opacity-40">%</span>
            <Sparkles className="h-8 w-8 fill-current text-primary animate-pulse" />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-12">
        {stats.categoryPerformance.map((cat, idx) => (
          <motion.div 
            key={cat.category} 
            className="space-y-6 group/item"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + (idx * 0.05) }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-[18px] bg-muted/50 flex items-center justify-center border border-border/40 group-hover/item:bg-primary/10 group-hover/item:border-primary/20 group-hover/item:scale-110 group-hover/item:rotate-3 transition-all duration-500 shadow-soft">
                  {cat.category === "Backend" ? (
                    <Terminal className="h-6 w-6 text-muted-foreground group-hover/item:text-primary transition-colors" />
                  ) : cat.category === "Frontend" ? (
                    <Monitor className="h-6 w-6 text-muted-foreground group-hover/item:text-primary transition-colors" />
                  ) : (
                    <Zap className="h-6 w-6 text-muted-foreground group-hover/item:text-primary transition-colors" />
                  )}
                </div>
                <div>
                  <span className="text-[17px] font-black tracking-tighter text-foreground block leading-none">{cat.category}</span>
                  <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.1em] mt-1 block">Subject Stream</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[20px] font-black tracking-tighter text-foreground block leading-none">{cat.percentage}%</span>
                  <span className={cn(
                    "text-[9px] font-black tracking-widest uppercase mt-1 block",
                    cat.percentage >= 80 ? "text-primary opacity-100" : "text-muted-foreground/40 opacity-60"
                  )}>
                    {cat.percentage >= 80 ? "OPTIMIZED" : "CALIBRATING"}
                  </span>
                </div>
              </div>
            </div>
            <div className="relative pt-1">
              <ProgressBar
                value={cat.percentage}
                color={cat.percentage >= 80 ? "primary" : "neutral"}
                size="sm"
                className="bg-muted h-3 rounded-full overflow-hidden"
              />
              {cat.percentage >= 80 && (
                <motion.div 
                  layoutId={`glow-${cat.category}`}
                  className="absolute top-0 right-0 w-3 h-3 bg-primary rounded-full blur-[2px] opacity-20"
                />
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
