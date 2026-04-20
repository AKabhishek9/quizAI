"use client";

import { motion } from "framer-motion";
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
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-foreground">Category Performance</h2>
        <span className="text-xs text-muted-foreground tabular-nums">
          Avg {stats.averageScore}%
        </span>
      </div>

      <div className="border border-border rounded-lg bg-card divide-y divide-border">
        {stats.categoryPerformance.map((cat, idx) => (
          <motion.div
            key={cat.category}
            className="flex items-center gap-3 px-4 py-3"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.04 }}
          >
            <span className="w-28 text-sm text-muted-foreground truncate shrink-0">
              {cat.category}
            </span>
            <div className="flex-1">
              <ProgressBar
                value={cat.percentage}
                color={cat.percentage >= 80 ? "primary" : "neutral"}
                showPercentage={false}
                size="sm"
                className="h-1.5"
              />
            </div>
            <span className={cn(
              "w-10 text-right text-xs tabular-nums font-medium shrink-0",
              cat.percentage >= 80 ? "text-primary" : "text-muted-foreground"
            )}>
              {cat.percentage}%
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
