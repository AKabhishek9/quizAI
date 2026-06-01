"use client";

import Link from "next/link";
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
    <div className="space-y-6 relative">
      {/* ── Zone 1 · Right Now ── */}
      <div className="space-y-4">
        <WelcomeBanner profile={profile} stats={stats} />

        {stats && stats.totalQuizzes === 0 && (
          <div className="p-6 rounded-xl border border-primary/20 bg-primary/5">
            <h3 className="text-lg font-semibold text-foreground mb-2 font-heading">Welcome to QuizAI!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your dashboard is currently empty. Take your first quiz to see your personalized stats, level progress, and performance trends come alive.
            </p>
            <Button render={<Link href="/quiz/stream" />} className="cursor-pointer">
              Take Your First Quiz
            </Button>
          </div>
        )}

        {profile && <LevelProgressBanner profile={profile} stats={stats} />}
      </div>

      {/* ── Zone 2 · Your Numbers ── */}
      {isLoading ? (
        <StatsSkeleton />
      ) : stats ? (
        <DashboardStats stats={stats} weeklyEvolution={weeklyEvolution} />
      ) : (
        <div className="p-6 text-sm text-muted-foreground card-base border-dashed">
          No performance stats yet. Complete your first quiz to unlock progress insights.
        </div>
      )}

      {/* ── Zone 3 · Trend + Activity ── */}
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,55fr)_minmax(0,45fr)] gap-4">
        <div className="p-4 flex flex-col gap-3 card-base">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground font-heading">Performance Trend</h2>
            <span className="text-[10px] font-semibold text-muted-foreground border border-border/20 bg-muted/20 rounded-md px-2 py-0.5">
              Last 10 sessions
            </span>
          </div>
          {isLoading ? <SkeletonChart /> : stats ? (
            <PerformanceChart data={stats.weeklyScores} />
          ) : null}
        </div>

        {isLoading ? (
          <SkeletonCard />
        ) : history ? (
          <RecentActivity attempts={history} />
        ) : (
          <div className="p-6 text-sm text-muted-foreground card-base border-dashed">
            Activity will appear here after your first attempts.
          </div>
        )}
      </div>

      {/* ── Zone 4 · Today's Quizzes + Skills ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[minmax(0,40fr)_minmax(0,60fr)] gap-4">
        <DailyQuizWidget />
        {stats && <SkillEquilibrium stats={stats} />}
      </div>
    </div>
  );
}
