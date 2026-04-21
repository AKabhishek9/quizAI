"use client";

import { motion } from "framer-motion";

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
  const cats = stats.categoryPerformance;

  return (
    <section className="border border-border rounded-lg bg-card p-4 flex flex-col gap-3">
      <h2 className="text-sm font-medium text-foreground">Category Breakdown</h2>

      {/* 2-column grid of category rows */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
        {cats.map((cat, idx) => (
          <motion.div
            key={cat.category}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.04 }}
            className="flex flex-col gap-1"
          >
            {/* Name + Avg */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground">{cat.category}</span>
              <span className="text-[11px] text-muted-foreground tabular-nums">
                Avg {cat.percentage}%
              </span>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${cat.percentage}%` }}
                transition={{ duration: 0.6, delay: idx * 0.05, ease: "easeOut" }}
              />
            </div>
            {/* Percentage value at end of bar */}
            <span className="text-[10px] text-muted-foreground/70 tabular-nums self-end">
              {cat.percentage}%
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
