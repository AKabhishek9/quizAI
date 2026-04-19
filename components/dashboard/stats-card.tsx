"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  variant?: "blue" | "green" | "yellow" | "orange";
  trend?: {
    value: number;
    isPositive: boolean;
  };
  total?: string | number;
  className?: string;
}

const variants = {
  blue: {
    bg: "bg-gradient-to-br from-indigo-500/10 to-purple-500/10",
    iconBg: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
    accent: "text-indigo-600 dark:text-indigo-400"
  },
  green: {
    bg: "bg-gradient-to-br from-emerald-500/10 to-teal-500/10",
    iconBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    accent: "text-emerald-600 dark:text-emerald-400"
  },
  yellow: {
    bg: "bg-gradient-to-br from-amber-500/10 to-orange-500/10",
    iconBg: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    accent: "text-amber-600 dark:text-amber-400"
  },
  orange: {
    bg: "bg-gradient-to-br from-rose-500/10 to-orange-500/10",
    iconBg: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
    accent: "text-rose-600 dark:text-rose-400"
  }
};

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  variant = "blue",
  trend,
  total,
  className,
}: StatsCardProps) {
  const v = variants[variant];

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        "relative group overflow-hidden rounded-[24px] border border-border/40 p-7 transition-all duration-500 bg-card/40 backdrop-blur-sm whisper-shadow hover:bg-card/60 cursor-default",
        v.bg,
        className
      )}
    >
      {/* Background Glow Effect */}
      <div className={cn(
        "absolute -right-8 -bottom-8 w-32 h-32 rounded-full blur-[40px] opacity-10 transition-opacity duration-500 group-hover:opacity-20",
        v.bg
      )} />

      {/* Header with Icon and Trend */}
      <div className="flex items-center justify-between mb-6">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:rotate-[10deg] shadow-soft border border-border/20",
          v.iconBg
        )}>
          <Icon className="h-6 w-6" />
        </div>

        {trend && (
          <div className={cn(
            "px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest flex items-center gap-1 border border-border/40 shadow-sm bg-background/20 backdrop-blur-md",
            trend.isPositive ? "text-success" : "text-destructive"
          )}>
            {trend.isPositive ? "↑" : "↓"} {trend.value}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-1 relative z-10">
        <p className="text-[11px] font-extrabold tracking-[0.15em] text-muted-foreground uppercase opacity-80">
          {title}
        </p>
        <div className="flex items-baseline gap-2">
          <h4 className="text-4xl font-black tracking-tighter text-foreground font-heading">
            {value}
          </h4>
          {total && (
            <span className="text-xs text-muted-foreground/40 font-bold tracking-tight">
              / {total}
            </span>
          )}
        </div>
        {description && (
          <p className="text-[11px] text-muted-foreground/60 font-medium mt-2 leading-relaxed max-w-[80%]">
            {description}
          </p>
        )}
      </div>
    </motion.div>
  );
}
