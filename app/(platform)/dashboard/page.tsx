"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroRow } from "@/components/dashboard/hero-row";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { DailyQuizWidget } from "@/components/dashboard/daily-quiz-widget";
import { SkillEquilibrium } from "@/components/dashboard/skill-equilibrium";
import StatsSkeleton from "@/components/dashboard/stats-skeleton";
import {
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
          <h2 className="text-sm font-semibold text-foreground mb-1 font-heading">Failed to load dashboard</h2>
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
    <div className="flex flex-col gap-3">
      {/* ── Row 1 · Hero ── */}
      <HeroRow profile={profile} stats={stats} />

      {/* ── Row 1.5 · First-time user onboarding (hidden once they have quizzes) ── */}
      {stats && stats.totalQuizzes === 0 && (
        <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
          <h3 className="text-sm font-semibold text-foreground mb-1 font-heading">Welcome to QuizAI!</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Take your first quiz to see stats, level progress, and performance trends.
          </p>
          <Button render={<Link href="/quiz/stream" />} size="sm" className="cursor-pointer h-7 text-xs">
            Take Your First Quiz
          </Button>
        </div>
      )}

      {/* ── Row 2 · Stat Cards ── */}
      {isLoading ? (
        <StatsSkeleton />
      ) : stats ? (
        <DashboardStats stats={stats} weeklyEvolution={weeklyEvolution} />
      ) : null}

      {/* ── Row 3 · Chart (left) + Activity (right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,55fr)_minmax(0,45fr)] gap-3">
        <div className="p-3 flex flex-col gap-2 card-base">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground font-heading">Performance Trend</h2>
            <span className="text-[10px] font-semibold text-muted-foreground border border-border/20 bg-muted/20 rounded-md px-1.5 py-0.5">
              Last 10 sessions
            </span>
          </div>
          {isLoading ? (
            <div className="h-[180px] rounded-lg bg-muted/40 animate-pulse" />
          ) : stats ? (
            <PerformanceChart data={stats.weeklyScores} />
          ) : (
            <div className="h-[180px] flex items-center justify-center text-xs text-muted-foreground border border-dashed border-border/30 rounded-lg">
              No data yet
            </div>
          )}
        </div>

        {isLoading ? (
          <SkeletonCard className="h-full" />
        ) : history ? (
          <RecentActivity attempts={history} />
        ) : (
          <div className="p-4 text-xs text-muted-foreground card-base flex items-center justify-center border-dashed">
            Activity appears after your first quiz.
          </div>
        )}
      </div>

      {/* ── Row 4 · Quests (left) + Topic Progress (right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <DailyQuizWidget />
        {stats && <SkillEquilibrium stats={stats} />}
      </div>
    </div>
  );
}
