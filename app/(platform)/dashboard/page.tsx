"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Zap } from "lucide-react";
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

  // Weekly Evolution Calculation
  const weeklyEvolution = stats?.weeklyScores && stats.weeklyScores.length >= 2
    ? stats.weeklyScores[stats.weeklyScores.length - 1].score - stats.weeklyScores[stats.weeklyScores.length - 2].score
    : 0;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] pt-12">
        <div className="rounded-[40px] border border-destructive/10 bg-card/40 p-12 text-center max-w-md whisper-shadow backdrop-blur-xl">
          <div className="w-20 h-20 rounded-[28px] bg-destructive/10 flex items-center justify-center mx-auto mb-8 shadow-soft border border-destructive/20">
            <Zap className="text-destructive h-10 w-10" />
          </div>
          <h2 className="text-3xl font-black tracking-tighter text-foreground mb-4 font-heading">
            System Synchronization Failure
          </h2>
          <p className="text-[13px] text-muted-foreground font-bold mb-10 leading-relaxed opacity-70">
            {error instanceof Error ? error.message : "We encountered a terminal issue calibrating your learning telemetry."}
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            className="rounded-full w-full h-14 font-black tracking-tighter shadow-glow-primary active:scale-[0.98] transition-all bg-primary"
          >
            Re-establish Connection
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-20">
      {/* Header & Motivational Section */}
      <WelcomeBanner profile={profile} />

      {/* Stats Grid */}
      {isLoading ? (
        <SkeletonStatsGrid />
      ) : stats ? (
        <DashboardStats stats={stats} weeklyEvolution={weeklyEvolution} />
      ) : null}

      {/* Level Progress Banner */}
      {profile && <LevelProgressBanner profile={profile} stats={stats} />}

      {/* Daily Quests Section */}
      <DailyQuizWidget />

      {/* Chart + Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 flex flex-col space-y-6">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-xl font-black tracking-tighter text-foreground font-heading uppercase italic">Performance Telemetry</h3>
            <div className="flex bg-muted/30 p-1 rounded-full border border-border/10 shadow-soft">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setViewMode("generalized")}
                className={cn(
                  "h-8 rounded-full px-4 text-[10px] font-black uppercase tracking-widest transition-all",
                  viewMode === "generalized" ? "bg-card shadow-soft border border-border/20 text-primary" : "opacity-40 hover:opacity-100"
                )}
              >
                Generalized
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setViewMode("specialized")}
                className={cn(
                  "h-8 rounded-full px-4 text-[10px] font-black uppercase tracking-widest transition-all",
                  viewMode === "specialized" ? "bg-card shadow-soft border border-border/20 text-primary" : "opacity-40 hover:opacity-100"
                )}
              >
                Specialized
              </Button>
            </div>
          </div>
          {isLoading ? (
            <SkeletonChart />
          ) : stats ? (
            <div className="h-full">
              <PerformanceChart data={stats.weeklyScores} />
            </div>
          ) : null}
        </div>
        <div className="lg:col-span-4">
          {isLoading ? (
            <SkeletonCard className="h-full" />
          ) : history ? (
            <RecentActivity attempts={history} />
          ) : null}
        </div>
      </div>

      {/* Knowledge Analysis */}
      {stats && <SkillEquilibrium stats={stats} />}
    </div>
  );
}
