"use client";

import { BookOpen, Target, Trophy, type LucideIcon } from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";

interface DashboardStatsProps {
  stats: {
    totalQuizzes: number;
    averageScore: number;
    rank: number;
  };
  weeklyEvolution: number;
}

export function DashboardStats({ stats, weeklyEvolution }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatsCard
        title="Quizzes Completed"
        value={stats.totalQuizzes}
        icon={BookOpen as unknown as LucideIcon}
        trend={{ value: weeklyEvolution, isPositive: weeklyEvolution >= 0 }}
        description="Total sessions"
      />
      <StatsCard
        title="Average Score"
        value={`${stats.averageScore}%`}
        icon={Target as unknown as LucideIcon}
        description="Global accuracy"
      />
      <StatsCard
        title="Ranking"
        value={`#${stats.rank}`}
        total="2.4k"
        icon={Trophy as unknown as LucideIcon}
        description="Current position"
      />
    </div>
  );
}
