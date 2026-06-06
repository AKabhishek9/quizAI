"use client";

import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

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
  const hasData = cats.some((cat) => cat.category !== "No Data" && cat.percentage > 0);

  return (
    <section className="p-4 flex flex-col gap-3 card-base">
      <h2 className="text-sm font-medium text-foreground font-heading">Category Breakdown</h2>

      {!hasData ? (
        <EmptyState
          icon={<BarChart3 className="h-7 w-7 text-muted-foreground" />}
          title="No category data yet"
          description="Complete a quiz to see your strengths and practice areas."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          {cats.map((cat, idx) => (
            <motion.div
              key={cat.category}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="flex flex-col gap-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="truncate text-xs font-medium text-foreground">{cat.category}</span>
                <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                  {cat.percentage}%
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${cat.percentage}%` }}
                  transition={{ duration: 0.6, delay: idx * 0.05, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
