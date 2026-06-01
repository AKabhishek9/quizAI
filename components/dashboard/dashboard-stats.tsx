"use client";

import { BookOpen, Target, Trophy, Flame, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { StatsCard } from "@/components/dashboard/stats-card";

interface DashboardStatsProps {
  stats: {
    totalQuizzes: number;
    averageScore: number;
    currentStreak: number;
    rank: number;
  };
  weeklyEvolution: number;
}

export function DashboardStats({ stats, weeklyEvolution }: DashboardStatsProps) {
  const scoreClass =
    stats.averageScore >= 80
      ? "border-success/25 bg-success/5"
      : stats.averageScore >= 50
      ? "border-warning/25 bg-warning/5"
      : "border-destructive/25 bg-destructive/5";

  const cards = [
    {
      title: "Quizzes Completed",
      value: stats.totalQuizzes,
      icon: BookOpen as unknown as LucideIcon,
      trend: { value: weeklyEvolution, isPositive: weeklyEvolution >= 0 },
      description: "Total sessions",
      className: "border-primary/25 bg-primary/5",
    },
    {
      title: "Average Score",
      value: `${stats.averageScore}%`,
      icon: Target as unknown as LucideIcon,
      description: "Global accuracy",
      className: scoreClass,
    },
    {
      // Current streak — the dominant, always-actionable metric (Duolingo lesson)
      title: "Current Streak",
      value: `${stats.currentStreak}d`,
      icon: Flame as unknown as LucideIcon,
      description: stats.currentStreak > 0 ? "Keep it going!" : "Start today",
      className:
        stats.currentStreak > 0
          ? "border-warning/40 bg-warning/5"
          : "border-border",
    },
    {
      title: "Ranking",
      value: `#${stats.rank}`,
      icon: Trophy as unknown as LucideIcon,
      description: "Current position",
      className: "border-border",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.06 }}
        >
          <StatsCard {...card} />
        </motion.div>
      ))}
    </div>
  );
}
