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
    bg: "bg-grad-blue",
    iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    trend: "bg-blue-500/10 text-blue-600 dark:text-blue-400"
  },
  green: {
    bg: "bg-grad-green",
    iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    trend: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
  },
  yellow: {
    bg: "bg-grad-yellow",
    iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    trend: "bg-amber-500/10 text-amber-600 dark:text-amber-400"
  },
  orange: {
    bg: "bg-grad-orange",
    iconBg: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    trend: "bg-orange-500/10 text-orange-600 dark:text-orange-400"
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
      whileHover={{ y: -2, scale: 1.01 }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border p-6 transition-all duration-300 shadow-sm hover:shadow-md cursor-default bg-card",
        v.bg,
        className
      )}
    >
      {/* Trend Badge */}
      {trend && (
        <div className={cn(
          "absolute top-4 right-4 px-2 py-1 rounded-full text-[10px] font-bold tracking-tight flex items-center gap-0.5 border border-current/10 shadow-sm",
          v.trend
        )}>
          {trend.isPositive ? "↑" : "↓"} {trend.value}%
        </div>
      )}

      <div className="flex flex-col gap-4">
        {/* Icon Box */}
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-sm border border-current/5",
          v.iconBg
        )}>
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <p className="text-[11px] font-bold tracking-[0.05em] text-foreground/70 uppercase mb-1 opacity-80">
            {title}
          </p>
          <div className="flex items-baseline gap-1">
            <h4 className="text-3xl font-semibold tracking-tight text-foreground">
              {value}
            </h4>
            {total && (
              <span className="text-xs text-foreground/50 font-medium">
                / {total}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
