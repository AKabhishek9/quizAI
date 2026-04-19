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
import { getUserDashboard } from "@/lib/api";
import type { UserProfile, UserStats, QuizAttempt } from "@/lib/types";
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
    <div className="space-y-6">
      {/* Profile header */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-card p-6"
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">
              {profile?.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          <div className="text-center sm:text-left flex-1">
            <h1 className="text-lg font-semibold tracking-tight">
              {profile?.name}
            </h1>
            <div className="flex flex-col sm:flex-row items-center gap-2 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {profile?.email}
              </span>
              <span className="hidden sm:inline text-border">·</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Since {profile?.memberSince}
              </span>
            </div>

            {profile && (
              <div className="mt-3 max-w-xs">
                <ProgressBar
                  label={`Level ${profile.level}`}
                  value={(profile.xp / profile.xpToNextLevel) * 100}
                  size="sm"
                />
                <p className="text-[11px] text-muted-foreground mt-1 tabular-nums">
                  {profile.xp} / {profile.xpToNextLevel} XP
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatsCard title="Quizzes" value={stats.totalQuizzes} icon={BookOpen} />
          <StatsCard title="Avg. Score" value={`${stats.averageScore}%`} icon={Target} />
          <StatsCard title="Best Streak" value={`${stats.bestStreak}d`} icon={Flame} />
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
        <TabsContent value="history">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="hidden sm:grid grid-cols-5 gap-3 px-5 py-2.5 border-b border-border text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              <span>Quiz</span>
              <span>Score</span>
              <span>Difficulty</span>
              <span>Time</span>
              <span>Date</span>
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
                  <p className="text-[13px] font-medium truncate">{attempt.quizTitle}</p>
                  <p className="text-[11px] text-muted-foreground sm:hidden">{attempt.date}</p>
                </div>
                <div className="flex items-center">
                  <span
                    className={cn(
                      "text-xs font-semibold tabular-nums",
                      attempt.score >= 80
                        ? "text-success"
                        : attempt.score >= 50
                        ? "text-warning"
                        : "text-destructive"
                    )}
                  >
                    {attempt.score}%
                  </span>
                </div>
                <div className="flex items-center">
                  <DifficultyBadge difficulty={attempt.difficulty} />
                </div>
                <div className="hidden sm:flex items-center text-xs text-muted-foreground tabular-nums">
                  {Math.floor(attempt.timeTaken / 60)}m {attempt.timeTaken % 60}s
                </div>
                <div className="hidden sm:flex items-center text-xs text-muted-foreground">
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
