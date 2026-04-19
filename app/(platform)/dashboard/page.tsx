"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Trophy, TrendingUp, ArrowRight, Star, LucideIcon } from "lucide-react";
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
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";

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
      <div className="flex flex-col items-center justify-center min-h-[50vh] pt-12">
        <div className="rounded-3xl border border-border bg-card/50 p-10 text-center max-w-md shadow-sm backdrop-blur-sm">
          <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-destructive text-3xl">error</span>
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground mb-2">Could not load dashboard</h2>
          <p className="text-sm text-foreground/60 mb-6 leading-relaxed">
            {error instanceof Error ? error.message : "We encountered an issue fetching your data."}
          </p>
          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => window.location.reload()} 
              className="rounded-xl w-full py-6 font-semibold shadow-md active:scale-[0.98] transition-all"
            >
              Refresh Dashboard
            </Button>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">
              Check your connection or restart the server
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-8 space-y-12 pb-16">
      {/* Header & Motivational Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-8 mt-4"
      >
        <div className="space-y-1.5">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            {profile ? `Welcome back, ${profile.name.split(" ")[0]} 👋` : "Dashboard"}
          </h1>
          <p className="text-[15px] font-medium text-foreground/60">
            Keep up the momentum! You're doing great.
          </p>
        </div>
        <Link href="/quiz">
          <Button className="h-11 px-8 rounded-xl bg-primary hover:bg-primary/90 transition-all shadow-md border-0 text-white font-semibold cursor-pointer">
            Start New Quiz
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </motion.div>

      {/* Level Progress Banner */}
      {profile && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl border border-border bg-card/50 p-10 shadow-sm backdrop-blur-sm"
        >
          <div className="p-6 lg:p-8 flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0 relative">
              <div className="w-14 h-14 rounded-2xl bg-warning/10 flex items-center justify-center border border-warning/20 shadow-sm">
                <span className="material-symbols-outlined text-warning text-2xl">military_tech</span>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-background shadow-sm">
                Lv. {profile.level}
              </div>
            </div>
            
            <div className="flex-1 w-full space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Learning Path Progress</h4>
                  <p className="text-[12px] text-foreground/60 font-medium">{profile.xpToNextLevel - profile.xp} XP to next level</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-primary">{profile.xp}</span>
                  <span className="text-[11px] font-semibold text-foreground/50"> / {profile.xpToNextLevel} XP</span>
                </div>
              </div>
              <ProgressBar
                value={(profile.xp / profile.xpToNextLevel) * 100}
                showPercentage={false}
                size="md"
                className="bg-muted h-2 rounded-full"
              />
            </div>

            <div className="hidden md:block w-px h-10 bg-border" />

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-warning text-[20px] fill-1">local_fire_department</span>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/60 leading-none mb-1">Weekly Streak</p>
                <p className="text-base font-bold text-foreground leading-none">4 Days</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      {isLoading ? (
        <SkeletonStatsGrid />
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <StatsCard
            title="Total Quizzes"
            value={stats.totalQuizzes}
            icon={BookOpen as unknown as LucideIcon}
            variant="blue"
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Accuracy"
            value={`${stats.averageScore}%`}
            icon={TrendingUp as unknown as LucideIcon}
            variant="green"
            trend={{ value: 5, isPositive: true }}
          />
          <StatsCard
            title="Global Rank"
            value={`#${stats.rank}`}
            total={2000}
            icon={Trophy as unknown as LucideIcon}
            variant="orange"
          />
        </div>
      ) : null}

      {/* Chart + Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
          {isLoading ? <SkeletonChart /> : stats ? <PerformanceChart data={stats.weeklyScores} /> : null}
        </div>
        <div className="lg:col-span-4">
          {isLoading ? <SkeletonCard className="h-full" /> : history ? <RecentActivity attempts={history} /> : null}
        </div>
      </div>

      {/* Recommended Section (Clean) */}
      <section className="space-y-8">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <h3 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Recommended for You</h3>
          <Button variant="ghost" size="sm" className="text-primary font-semibold hover:bg-primary/5">
            View all library <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Advanced React Hooks", time: "15 min", xp: "250 XP", cat: "Frontend" },
            { title: "TypeScript Generics", time: "10 min", xp: "180 XP", cat: "Types" },
            { title: "Next.js 15 Internals", time: "20 min", xp: "300 XP", cat: "Fullstack" },
          ].map((quiz) => (
            <div key={quiz.title} className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/20 hover:shadow-md transition-all cursor-pointer">
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/5 px-2 py-0.5 rounded mb-4 inline-block">
                {quiz.cat}
              </span>
              <h4 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100 mb-6 group-hover:text-primary transition-colors">{quiz.title}</h4>
              <div className="flex items-center gap-4 text-[11px] font-medium text-slate-400">
                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">schedule</span> {quiz.time}</span>
                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">bolt</span> {quiz.xp}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Knowledge Breakdown (Unified Card) */}
      {stats && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-border bg-card p-8 shadow-sm"
        >
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Knowledge Analysis</h3>
              <p className="text-sm text-slate-400 font-medium">Detailed breakdown of your category performance</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Avg Mastery</p>
              <p className="text-2xl font-semibold text-primary mt-1">{stats.averageScore}%</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {stats.categoryPerformance.map((cat) => (
              <div key={cat.category} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-slate-400">
                      {cat.category === "Backend" ? "dns" : cat.category === "Frontend" ? "web" : "terminal"}
                    </span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{cat.category}</span>
                  </div>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight",
                    cat.percentage >= 80 ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-50 text-slate-500 border border-slate-100"
                  )}>
                    {cat.percentage >= 80 ? "EXPERT" : "LEARNING"}
                  </span>
                </div>
                <ProgressBar
                  value={cat.percentage}
                  color={cat.percentage >= 80 ? "success" : "primary"}
                  size="sm"
                  className="bg-slate-100 dark:bg-slate-800"
                />
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
