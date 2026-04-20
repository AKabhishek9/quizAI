"use client";

import { BookOpen, Target, Trophy, LucideIcon } from "lucide-react";
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      <StatsCard
        title="Knowledge Sessions"
        value={stats.totalQuizzes}
        icon={BookOpen as unknown as LucideIcon}
        variant="blue"
        trend={{ value: weeklyEvolution, isPositive: weeklyEvolution >= 0 }}
        description="Total assessments successfully completed."
      />
      <StatsCard
        title="Mastery Average"
        value={`${stats.averageScore}%`}
        icon={Target as unknown as LucideIcon}
        variant="green"
        trend={{ value: 5, isPositive: true }}
        description="Global accuracy across your entire journey."
      />
      <StatsCard
        title="Elite Ranking"
        value={`#${stats.rank}`}
        total="2.4k"
        icon={Trophy as unknown as LucideIcon}
        variant="orange"
        description="Your current position in the world hierarchy."
      />
    </div>
  );
}
