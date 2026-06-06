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
  const cards = [
    {
      title: "Quizzes Completed",
      value: stats.totalQuizzes,
      icon: BookOpen as unknown as LucideIcon,
      trend: { value: weeklyEvolution, isPositive: weeklyEvolution >= 0 },
      description: "Total sessions",
    },
    {
      title: "Average Score",
      value: `${stats.averageScore}%`,
      icon: Target as unknown as LucideIcon,
      description: "Global accuracy",
    },
    {
      // Current streak — the dominant, always-actionable metric (Duolingo lesson).
      // The one card that earns the orange accent.
      title: "Current Streak",
      value: `${stats.currentStreak}d`,
      icon: Flame as unknown as LucideIcon,
      description: stats.currentStreak > 0 ? "Keep it going!" : "Start today",
      accent: true,
      className: "border-primary/30",
    },
    {
      title: "Ranking",
      value: `#${stats.rank}`,
      icon: Trophy as unknown as LucideIcon,
      description: "Current position",
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
