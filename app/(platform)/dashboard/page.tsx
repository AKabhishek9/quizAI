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
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [viewMode, setViewMode] = useState<"generalized" | "specialized">("generalized");

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
          <Button
            onClick={() => window.location.reload()}
            size="sm"
            className="w-full h-8 text-xs cursor-pointer"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <WelcomeBanner profile={profile} />

      {/* Stats Row */}
      {isLoading ? <SkeletonStatsGrid /> : stats ? (
        <DashboardStats stats={stats} weeklyEvolution={weeklyEvolution} />
      ) : null}

      {/* Level Progress */}
      {profile && <LevelProgressBanner profile={profile} stats={stats} />}

      {/* Daily Quests */}
      <DailyQuizWidget />

      {/* Chart + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Performance Chart */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground">Performance</h2>
            <div className="flex items-center gap-1 border border-border rounded-md p-0.5">
              <button
                onClick={() => setViewMode("generalized")}
                className={cn(
                  "h-6 px-3 text-xs rounded transition-colors cursor-pointer",
                  viewMode === "generalized"
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Overview
              </button>
              <button
                onClick={() => setViewMode("specialized")}
                className={cn(
                  "h-6 px-3 text-xs rounded transition-colors cursor-pointer",
                  viewMode === "specialized"
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Specialized
              </button>
            </div>
          </div>
          {isLoading ? <SkeletonChart /> : stats ? (
            <PerformanceChart data={stats.weeklyScores} />
          ) : null}
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <SkeletonCard className="h-full" />
          ) : history ? (
            <RecentActivity attempts={history} />
          ) : null}
        </div>
      </div>

      {/* Category Performance */}
      {stats && <SkillEquilibrium stats={stats} />}
    </div>
  );
}
