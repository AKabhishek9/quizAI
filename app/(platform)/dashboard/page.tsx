"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { DailyQuizWidget } from "@/components/dashboard/daily-quiz-widget";
import { WelcomeBanner } from "@/components/dashboard/welcome-banner";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { LevelProgressBanner } from "@/components/dashboard/level-progress-banner";
import { SkillEquilibrium } from "@/components/dashboard/skill-equilibrium";
import {
  SkeletonStatsGrid,
  SkeletonChart,
  SkeletonCard,
} from "@/components/shared/skeleton-loader";
import { getUserDashboard } from "@/lib/api-client";
import { useAuth } from "@/components/providers/auth-provider";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getUserDashboard,
    enabled: !authLoading && !!user,
  });

  const stats = data?.stats;
  const profile = data?.profile;
  const history = data?.history;

  const weeklyEvolution =
    stats?.weeklyScores && stats.weeklyScores.length >= 2
      ? stats.weeklyScores[stats.weeklyScores.length - 1].score -
        stats.weeklyScores[stats.weeklyScores.length - 2].score
      : 0;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <div className="border border-border rounded-lg p-8 text-center max-w-sm bg-card">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-3" />
          <h2 className="text-sm font-semibold text-foreground mb-1">Failed to load dashboard</h2>
          <p className="text-xs text-muted-foreground mb-4">
            {error instanceof Error ? error.message : "Something went wrong."}
          </p>
          <Button onClick={() => window.location.reload()} size="sm" className="w-full h-8 text-xs cursor-pointer">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/*
        TOP ROW — 2-column split:
          Left (~55%): Greeting + Stats + Level bar
          Right (~45%): Performance Trend (3fr) | Recent Activity (2fr)
      */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,55fr)_minmax(0,45fr)] gap-4">
        {/* ── LEFT COLUMN ── */}
        <div className="flex flex-col gap-4">
          {/* Greeting + Start Quiz */}
          <WelcomeBanner profile={profile} />

          {/* Stats Cards */}
          {isLoading ? <SkeletonStatsGrid /> : stats ? (
            <DashboardStats stats={stats} weeklyEvolution={weeklyEvolution} />
          ) : null}

          {/* Level Bar */}
          {profile && <LevelProgressBanner profile={profile} stats={stats} />}
        </div>

        {/* ── RIGHT COLUMN: Performance Trend + Recent Activity side by side ── */}
        <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-4">
          {/* Performance Trend */}
          <div className="border border-border rounded-lg bg-card p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-foreground">Performance Trend</h2>
              <span className="text-[10px] font-medium text-muted-foreground border border-border rounded-md px-2 py-0.5">
                Database data
              </span>
            </div>
            {isLoading ? <SkeletonChart /> : stats ? (
              <PerformanceChart data={stats.weeklyScores} />
            ) : null}
          </div>

          {/* Recent Activity */}
          {isLoading ? (
            <SkeletonCard />
          ) : history ? (
            <RecentActivity attempts={history} />
          ) : null}
        </div>
      </div>

      {/*
        BOTTOM ROW — 2-column split:
          Left (~40%): Daily Quests
          Right (~60%): Category Breakdown
      */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,40fr)_minmax(0,60fr)] gap-4">
        {/* Daily Quests */}
        <DailyQuizWidget />

        {/* Category Breakdown */}
        {stats && <SkillEquilibrium stats={stats} />}
      </div>
    </div>
  );
}
