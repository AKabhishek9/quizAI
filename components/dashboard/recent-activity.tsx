"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { QuizAttempt } from "@/lib/types";
import { DifficultyBadge } from "@/components/quiz/difficulty-badge";
import { cn } from "@/lib/utils";
import { 
  Layers, 
  Palette, 
  Terminal, 
  Code, 
  Database, 
  Cpu, 
  Brain,
  Zap,
  Globe,
  Calculator
} from "lucide-react";

interface RecentActivityProps {
  attempts: QuizAttempt[];
}

const statusColors = (score: number) => {
  if (score >= 80) return "bg-success/10 text-success border border-success/20";
  if (score >= 60) return "bg-warning/10 text-warning border border-warning/20";
  return "bg-destructive/10 text-destructive border border-destructive/20";
};

const iconMapping = (category: string = "", quizTitle: string = "") => {
  const text = (category + " " + quizTitle).toLowerCase();
  if (text.includes("react") || text.includes("ui")) return Layers;
  if (text.includes("css") || text.includes("layout") || text.includes("style")) return Palette;
  if (text.includes("js") || text.includes("script")) return Cpu;
  if (text.includes("ts") || text.includes("type")) return Code;
  if (text.includes("db") || text.includes("data") || text.includes("sql")) return Database;
  if (text.includes("tech") || text.includes("ai")) return Brain;
  if (text.includes("math") || text.includes("calc")) return Calculator;
  if (text.includes("affair") || text.includes("globe") || text.includes("world")) return Globe;
  return Terminal;
};

export function RecentActivity({ attempts }: RecentActivityProps) {
  return (
    <div className="rounded-[40px] border border-border/40 bg-card/30 p-10 whisper-shadow h-full backdrop-blur-xl group hover:bg-card/40 transition-all duration-500">
      <div className="flex items-center justify-between mb-12">
        <h3 className="text-2xl font-black tracking-tighter text-foreground font-heading uppercase italic group-hover:not-italic transition-all">Telemetry Log</h3>
        <Link
          href="/profile"
          className="text-[10px] font-black tracking-[0.25em] text-primary uppercase hover:opacity-70 transition-all border-b border-primary/20 pb-0.5"
        >
          View Full Archive
        </Link>
      </div>

      <div className="relative space-y-10 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-[1px] before:bg-gradient-to-b before:from-primary/20 before:via-border/40 before:to-transparent">
        {attempts.slice(0, 4).map((attempt, index) => (
          <motion.div
            key={attempt.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative flex items-center justify-between group/item"
          >
            <div className="flex items-center w-full">
              {/* Timeline dot/icon */}
              {(() => {
                const Icon = iconMapping(attempt.category, attempt.quizTitle);
                return (
                  <div className="flex items-center justify-center w-10 h-10 rounded-[14px] border border-border/40 bg-card text-muted-foreground/40 group-hover/item:scale-110 group-hover/item:text-primary transition-all z-10 whisper-shadow overflow-hidden group-hover/item:border-primary/20 group-hover/item:shadow-glow-primary/10">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                );
              })()}

              {/* Content */}
              <div className="ml-6 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[14px] font-black tracking-tight text-foreground truncate group-hover/item:text-primary transition-colors">
                    {attempt.quizTitle}
                  </p>
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-lg text-[11px] font-black tracking-tighter shrink-0 border",
                    statusColors(attempt.score)
                  )}>
                    {attempt.score}%
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[11px] text-muted-foreground/40 font-bold tracking-tight">
                    {attempt.date}
                  </span>
                  <div className="w-1 h-1 rounded-full bg-border/40" />
                  <span className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground/30">
                    {attempt.difficulty} CLASSIFICATION
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
