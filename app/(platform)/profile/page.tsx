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
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      {/* Profile header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[40px] border border-border/40 bg-card/30 p-10 whisper-shadow backdrop-blur-xl"
      >
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="relative group">
            <Avatar className="h-24 w-24 border-4 border-background shadow-soft ring-4 ring-primary/10 transition-transform group-hover:scale-105 duration-500">
              <AvatarFallback className="bg-primary text-primary-foreground font-black text-2xl font-heading">
                {profile?.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2 bg-foreground text-background text-[11px] font-black px-4 py-1.5 rounded-full shadow-soft border-2 border-background">
              Lv. {profile?.level}
            </div>
          </div>

          <div className="text-center md:text-left flex-1 space-y-4">
            <div>
              <h1 className="text-4xl font-black tracking-tighter text-foreground font-heading mb-2">
                {profile?.name}
              </h1>
              <div className="flex flex-col sm:flex-row items-center gap-3 text-xs font-bold text-muted-foreground/60">
                <span className="flex items-center gap-2 hover:text-foreground transition-colors cursor-default">
                  <Mail className="h-3.5 w-3.5" />
                  {profile?.email}
                </span>
                <span className="hidden sm:inline text-border/40">|</span>
                <span className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" />
                  Initiated {profile?.memberSince}
                </span>
              </div>
            </div>

            {profile && (
              <div className="max-w-md pt-2">
                <div className="flex items-end justify-between mb-2.5">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Mastery Calibration</span>
                  <span className="text-[11px] font-black tabular-nums text-muted-foreground/40 italic">
                    {profile.xp} / {profile.xpToNextLevel} XP
                  </span>
                </div>
                <ProgressBar
                  value={(profile.xp / profile.xpToNextLevel) * 100}
                  size="md"
                  className="bg-muted h-3 rounded-full overflow-hidden"
                  showPercentage={false}
                />
              </div>
            )}
          </div>
        </div>
      </motion.div>

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
        <TabsContent value="history" className="mt-8 transition-all">
          <div className="rounded-[32px] border border-border/40 bg-card/30 overflow-hidden whisper-shadow backdrop-blur-md">
            <div className="hidden sm:grid grid-cols-5 gap-3 px-8 py-5 border-b border-border/50 text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">
              <span>Session Type</span>
              <span className="text-center">Performance</span>
              <span className="text-center">Complexity</span>
              <span className="text-center">Telemetry</span>
              <span className="text-right">Timecode</span>
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
