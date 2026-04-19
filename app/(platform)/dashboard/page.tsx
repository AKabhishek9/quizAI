"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Trophy, Flame, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/dashboard/stats-card";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import {
  SkeletonStatsGrid,
  SkeletonChart,
  SkeletonCard,
} from "@/components/shared/skeleton-loader";
import { getUserDashboard } from "@/lib/api";
import type { UserStats, UserProfile, QuizAttempt } from "@/lib/types";
import { useAuth } from "@/components/providers/auth-provider";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getUserDashboard,
    enabled: !authLoading && !!user,
  });

  const stats = data?.stats;
  const profile = data?.profile;
  const history = data?.history;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center max-w-md">
          <h2 className="text-base font-semibold mb-2">Could not load dashboard</h2>
          <p className="text-sm text-muted-foreground mb-4">{error instanceof Error ? error.message : String(error)}</p>
          <p className="text-xs text-muted-foreground">Make sure the backend server is running on port 5000.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3"
      >
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {profile ? `Welcome back, ${profile.name.split(" ")[0]}` : "Dashboard"}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your learning overview
          </p>
        </div>
        <Link href="/quiz">
          <Button size="sm" className="cursor-pointer h-8 text-xs font-medium">
            New quiz
            <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </Link>
      </motion.div>

      {/* Stats */}
      {isLoading ? (
        <SkeletonStatsGrid />
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <StatsCard
            title="Quizzes"
            value={stats.totalQuizzes}
            icon={BookOpen}
            trend={{ value: 12, isPositive: true }}
            description="vs last month"
          />
          <StatsCard
            title="Avg. Score"
            value={`${stats.averageScore}%`}
            icon={TrendingUp}
            trend={{ value: 5, isPositive: true }}
            description="vs last month"
          />
          {/* Streak hidden temporarily per request */}
          <StatsCard
            title="Rank"
            value={`#${stats.rank}`}
            icon={Trophy}
            description="of 2,000"
          />
        </div>
      ) : null}

      {/* Level */}
      {profile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium">
              Level {profile.level}
            </span>
            <span className="text-[11px] tabular-nums text-muted-foreground">
              {profile.xp} / {profile.xpToNextLevel} XP
            </span>
          </div>
          <ProgressBar
            value={(profile.xp / profile.xpToNextLevel) * 100}
            showPercentage={false}
            size="sm"
          />
        </motion.div>
      )}

      {/* Chart + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        <div className="lg:col-span-3">
          {isLoading ? <SkeletonChart /> : stats ? <PerformanceChart data={stats.weeklyScores} /> : null}
        </div>
        <div className="lg:col-span-2">
          {isLoading ? <SkeletonCard className="h-full" /> : history ? <RecentActivity attempts={history} /> : null}
        </div>
      </div>

      {/* Category */}
      {stats && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-5"
        >
          <h3 className="text-sm font-semibold mb-4">
            Category performance
          </h3>
          <div className="space-y-3">
            {stats.categoryPerformance.map((cat) => (
              <ProgressBar
                key={cat.category}
                label={cat.category}
                value={cat.percentage}
                color={
                  cat.percentage >= 80
                    ? "success"
                    : cat.percentage >= 60
                    ? "primary"
                    : cat.percentage >= 40
                    ? "warning"
                    : "destructive"
                }
                size="sm"
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
