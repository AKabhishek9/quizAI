"use client";

import { BookOpen, Target, Flame, Trophy, type LucideIcon } from "lucide-react";
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
      trend: weeklyEvolution !== 0 ? { value: weeklyEvolution, isPositive: weeklyEvolution >= 0 } : undefined,
    },
    {
      title: "Average Score",
      value: `${stats.averageScore}%`,
      icon: Target as unknown as LucideIcon,
    },
    {
      title: "Current Streak",
      value: `${stats.currentStreak}d`,
      icon: Flame as unknown as LucideIcon,
      accent: true,
      className: "border-primary/30",
    },
    {
      title: "Ranking",
      value: `#${stats.rank}`,
      icon: Trophy as unknown as LucideIcon,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.04 }}
        >
          <StatsCard {...card} />
        </motion.div>
      ))}
    </div>
  );
}
