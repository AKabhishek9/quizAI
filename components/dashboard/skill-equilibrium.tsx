"use client";

import Link from "next/link";
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
    <section className="p-3 flex flex-col card-base h-full">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium text-foreground font-heading">Topic Progress</h2>
        <Link
          href="/profile"
          className="text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          View all
        </Link>
      </div>

      {!hasData ? (
        <EmptyState
          icon={<BarChart3 className="h-5 w-5 text-muted-foreground" />}
          title="No category data yet"
          description="Complete a quiz to see your strengths."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
          {cats.map((cat, idx) => (
            <motion.div
              key={cat.category}
              initial={{ opacity: 0, x: -3 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="flex items-center gap-2"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="truncate text-[10px] font-medium text-foreground">{cat.category}</span>
                  <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground ml-2">
                    {cat.percentage}%
                  </span>
                </div>
                <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.percentage}%` }}
                    transition={{ duration: 0.5, delay: idx * 0.04, ease: "easeOut" }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
