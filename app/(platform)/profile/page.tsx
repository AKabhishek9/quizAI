"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, Trophy, BookOpen, Flame, Target, Pencil } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCard } from "@/components/dashboard/stats-card";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { DifficultyBadge } from "@/components/quiz/difficulty-badge";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { SkeletonStatsGrid, SkeletonCard } from "@/components/shared/skeleton-loader";
import { getUserDashboard } from "@/lib/api-client";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getUserDashboard,
    enabled: !authLoading && !!user,
  });

  const profile = data?.profile;
  const stats = data?.stats;
  const history = data?.history;

  if (!authLoading && !user) {
    router.push("/login");
    return null;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center max-w-md">
          <h2 className="text-base font-semibold mb-2">Could not load profile</h2>
          <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
          <p className="text-xs text-muted-foreground">Make sure the backend server is running on port 5000.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonStatsGrid />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* ── Profile Header Card ── */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Avatar with level badge */}
          <div className="relative shrink-0 self-center md:self-start">
            <Avatar className="h-20 w-20 border-2 border-border bg-muted">
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xl">
                {profile?.name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap">
              Level {profile?.level}
            </div>
          </div>

          {/* Name + Edit + Joined */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">
              {profile?.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <Pencil className="h-3 w-3" />
                Edit Profile
              </button>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                Joined {profile?.memberSince}
              </span>
            </div>
          </div>

          {/* Mastery XP — right side */}
          {profile && (
            <div className="shrink-0 w-full md:w-56 border border-border rounded-lg p-4 bg-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-foreground">Mastery XP</span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {profile.xp} / {profile.xpToNextLevel} XP
                </span>
              </div>
              <ProgressBar
                value={(profile.xp / profile.xpToNextLevel) * 100}
                size="sm"
                className="bg-muted h-2"
                showPercentage={false}
              />
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[10px] text-muted-foreground">text-neutral-400</span>
                <span className="text-[10px] text-muted-foreground">text-neutral-400</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Detailed Stats Grid ── */}
      {stats && (
        <div className="space-y-3">
          <h2 className="text-base font-bold text-foreground">Detailed Stats Grid</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <StatsCard title="Quizzes" value={stats.totalQuizzes} icon={BookOpen} />
            <StatsCard title="Avg. Score" value={`${stats.averageScore}%`} icon={Target} />
            <StatsCard
              title="Current Streak"
              value={`${stats.currentStreak}d`}
              icon={Flame}
              className={cn(stats.currentStreak > 0 && "border-orange-500/30")}
            />
            <StatsCard title="Best Streak" value={`${stats.bestStreak}d`} icon={Trophy} />
            <StatsCard title="Global Rank" value={`#${stats.rank}`} icon={Trophy} />
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      <Tabs defaultValue="history" className="space-y-4">
        <TabsList className="border-b border-border bg-transparent rounded-none p-0 h-auto gap-0 w-full justify-start">
          {[
            { value: "history", label: "Quiz History" },
            { value: "analytics", label: "Detailed Analytics" },
            { value: "achievements", label: "Achievements" },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="cursor-pointer text-sm rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=active]:bg-transparent px-4 pb-3 pt-1 text-muted-foreground"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Quiz History Table */}
        <TabsContent value="history" className="mt-2">
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            {/* Table header */}
            <div className="hidden sm:grid grid-cols-5 gap-4 px-6 py-3 border-b border-border bg-muted/30 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              <span>Quiz</span>
              <span>Score</span>
              <span>Difficulty</span>
              <span>Time Taken</span>
              <span>Date</span>
            </div>

            {/* Table rows */}
            {history?.map((attempt, index) => (
              <motion.div
                key={attempt.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.02 }}
                className="grid grid-cols-2 sm:grid-cols-5 gap-4 px-6 py-3.5 border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
              >
                {/* Quiz name */}
                <div className="col-span-2 sm:col-span-1 flex items-center">
                  <p className="text-sm font-medium text-foreground truncate">{attempt.quizTitle}</p>
                </div>

                {/* Score */}
                <div className="flex items-center">
                  <span className="text-sm text-foreground tabular-nums">{attempt.score}%</span>
                </div>

                {/* Difficulty */}
                <div className="flex items-center">
                  <DifficultyBadge difficulty={attempt.difficulty} />
                </div>

                {/* Time Taken */}
                <div className="hidden sm:flex items-center">
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {Math.floor(attempt.timeTaken / 60)}m {attempt.timeTaken % 60}s
                  </span>
                </div>

                {/* Date */}
                <div className="hidden sm:flex items-center">
                  <span className="text-sm text-muted-foreground">{attempt.date}</span>
                </div>
              </motion.div>
            ))}

            {(!history || history.length === 0) && (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-muted-foreground">No quiz history yet. Start a quiz!</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Detailed Analytics */}
        <TabsContent value="analytics" className="space-y-4 mt-2">
          {stats && (
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="text-sm font-semibold mb-3">Performance Trend</h3>
              <PerformanceChart data={stats.weeklyScores} />
            </div>
          )}
          {stats && (
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="text-sm font-semibold mb-3">Category Performance</h3>
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
            </div>
          )}
        </TabsContent>

        {/* Achievements (placeholder) */}
        <TabsContent value="achievements" className="mt-2">
          <div className="rounded-lg border border-border bg-card p-12 flex flex-col items-center justify-center text-center gap-3">
            <Trophy className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">Achievements coming soon</p>
            <p className="text-xs text-muted-foreground/60">Complete quizzes to unlock badges and milestones.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
