"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Calendar, Trophy, BookOpen, Flame, Target } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCard } from "@/components/dashboard/stats-card";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { DifficultyBadge } from "@/components/quiz/difficulty-badge";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { SkeletonStatsGrid, SkeletonCard } from "@/components/shared/skeleton-loader";
import { getUserDashboard } from "@/lib/api-client";
import type {  } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getUserDashboard,
    enabled: !authLoading && !!user,
  });

  const profile = data?.profile;
  const stats = data?.stats;
  const history = data?.history;

  if (!authLoading && !user) {
    router.push('/login');
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
      {/* Profile header */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative group">
            <Avatar className="h-20 w-20 border border-border bg-muted">
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xl">
                {profile?.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 bg-foreground text-background text-[10px] font-bold px-2 py-0.5 rounded border border-background">
              Lv. {profile?.level}
            </div>
          </div>

          <div className="text-center md:text-left flex-1">
            <div className="mb-4">
              <h1 className="text-xl font-semibold tracking-tight text-foreground mb-1">
                {profile?.name}
              </h1>
              <div className="flex flex-col sm:flex-row items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3 w-3" />
                  {profile?.email}
                </span>
                <span className="hidden sm:inline opacity-30">|</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" />
                  Joined {profile?.memberSince}
                </span>
              </div>
            </div>

            {profile && (
              <div className="max-w-xs pt-1">
                <div className="flex items-end justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Mastery</span>
                  <span className="text-[10px] tabular-nums text-muted-foreground/60">
                    {profile.xp} / {profile.xpToNextLevel} XP
                  </span>
                </div>
                <ProgressBar
                  value={(profile.xp / profile.xpToNextLevel) * 100}
                  size="sm"
                  className="bg-muted h-1.5"
                  showPercentage={false}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <StatsCard title="Quizzes" value={stats.totalQuizzes} icon={BookOpen} />
          <StatsCard title="Avg. Score" value={`${stats.averageScore}%`} icon={Target} />
          <StatsCard 
            title="Current Streak" 
            value={`${stats.currentStreak}d`} 
            icon={Flame} 
            className={cn(stats.currentStreak > 0 && "text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.2)]")} 
          />
          <StatsCard title="Best Streak" value={`${stats.bestStreak}d`} icon={Trophy} />
          <StatsCard title="Rank" value={`#${stats.rank}`} icon={Trophy} />
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="history" className="space-y-4">
        <TabsList>
          <TabsTrigger value="history" className="cursor-pointer text-xs">
            History
          </TabsTrigger>
          <TabsTrigger value="analytics" className="cursor-pointer text-xs">
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* History */}
        <TabsContent value="history" className="mt-6">
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="hidden sm:grid grid-cols-5 gap-3 px-6 py-3 border-b border-border bg-muted/30 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              <span>Quiz</span>
              <span className="text-center">Score</span>
              <span className="text-center">Difficulty</span>
              <span className="text-center">Time Taken</span>
              <span className="text-right">Date</span>
            </div>

            {history?.map((attempt, index) => (
              <motion.div
                key={attempt.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.02 }}
                className="grid grid-cols-2 sm:grid-cols-5 gap-3 px-5 py-3 border-b border-border last:border-0 hover:bg-secondary/30 transition-colors cursor-pointer"
              >
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-[14px] font-black tracking-tight text-foreground truncate">{attempt.quizTitle}</p>
                  <p className="text-[10px] font-bold text-muted-foreground/40 sm:hidden mt-0.5">{attempt.date}</p>
                </div>
                <div className="flex items-center justify-center">
                  <span
                    className={cn(
                      "text-sm font-black tabular-nums px-2.5 py-1 rounded-lg",
                      attempt.score >= 80
                        ? "bg-success/10 text-success border border-success/20"
                        : attempt.score >= 50
                        ? "bg-warning/10 text-warning border border-warning/20"
                        : "bg-destructive/10 text-destructive border border-destructive/20"
                    )}
                  >
                    {attempt.score}%
                  </span>
                </div>
                <div className="flex items-center justify-center">
                  <DifficultyBadge difficulty={attempt.difficulty} />
                </div>
                <div className="hidden sm:flex items-center justify-center text-[13px] font-bold text-muted-foreground/60 tabular-nums">
                  {Math.floor(attempt.timeTaken / 60)}m {attempt.timeTaken % 60}s
                </div>
                <div className="hidden sm:flex items-center justify-end text-[12px] font-bold text-muted-foreground/40">
                  {attempt.date}
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          {stats && <PerformanceChart data={stats.weeklyScores} />}

          {stats && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold mb-3">
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
            </div>
          )}

          {stats && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold mb-4">Accuracy</h3>
              <div className="flex items-center gap-5">
                <div className="relative h-16 w-16">
                  <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      className="stroke-secondary"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      className="stroke-primary"
                      strokeWidth="3"
                      strokeDasharray={`${Math.round((stats.totalCorrect / stats.totalQuestions) * 100)}, 100`}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold tabular-nums">
                    {Math.round((stats.totalCorrect / stats.totalQuestions) * 100)}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalCorrect} correct out of {stats.totalQuestions} questions
                </p>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
