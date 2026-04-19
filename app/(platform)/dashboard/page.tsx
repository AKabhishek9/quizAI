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
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center max-w-md">
          <h2 className="text-base font-black mb-2">Could not load dashboard</h2>
          <p className="text-sm text-muted-foreground mb-4">{error instanceof Error ? error.message : String(error)}</p>
          <p className="text-xs text-muted-foreground font-medium">Please check your connection or restart the backend server.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-12">
      {/* Header & Motivational Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-on-surface">
            {profile ? `Welcome back, ${profile.name.split(" ")[0]} 👋` : "Dashboard"}
          </h1>
          <p className="text-[15px] font-medium text-on-surface-variant/70">
            Keep up the momentum! You're doing great.
          </p>
        </div>
        <Link href="/quiz">
          <Button className="h-12 px-8 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-105 transition-all shadow-glow-primary border-0 text-white font-bold cursor-pointer">
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
          className="relative overflow-hidden rounded-2xl border border-outline-variant/10 bg-surface-container-low p-1 shadow-soft"
        >
          <div className="bg-surface-container-lowest rounded-[14px] p-6 lg:p-8 flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-shrink-0 relative">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <span className="material-symbols-outlined text-amber-500 text-3xl">military_tech</span>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg border-2 border-surface-container-lowest">
                Lv. {profile.level}
              </div>
            </div>
            
            <div className="flex-1 w-full space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-[15px] font-bold text-on-surface">Elite Scholar Progress</h4>
                  <p className="text-[12px] text-on-surface-variant/60 font-medium">Earn {profile.xpToNextLevel - profile.xp} more XP to reach Level {profile.level + 1}</p>
                </div>
                <div className="text-right">
                  <span className="text-[15px] font-black text-primary">{profile.xp}</span>
                  <span className="text-[12px] font-bold text-on-surface-variant/40"> / {profile.xpToNextLevel} XP</span>
                </div>
              </div>
              <ProgressBar
                value={(profile.xp / profile.xpToNextLevel) * 100}
                showPercentage={false}
                size="md"
                className="bg-surface-container-high h-2.5"
              />
            </div>

            <div className="hidden lg:block w-px h-12 bg-outline-variant/10" />

            <div className="flex items-center gap-4 text-center lg:text-left">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 mb-1">Weekly Streak</p>
                <div className="flex items-center gap-1.5 justify-center lg:justify-start">
                  <span className="material-symbols-outlined text-orange-500 text-[20px] fill-1">local_fire_department</span>
                  <span className="text-lg font-black text-on-surface">4 Days</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      {isLoading ? (
        <SkeletonStatsGrid />
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-8">
          {isLoading ? (
            <SkeletonChart />
          ) : stats ? (
            <PerformanceChart data={stats.weeklyScores} />
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

      {/* Recommended for You (Mock) */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black tracking-tighter text-on-surface">Recommended for You</h3>
          <span className="text-xs font-bold text-primary flex items-center gap-1 cursor-pointer">
            Explore more <ArrowRight className="w-3 h-3" />
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "Advanced React Hooks", time: "15 min", xp: "250 XP", cat: "Frontend" },
            { title: "TypeScript Generics", time: "10 min", xp: "180 XP", cat: "Types" },
            { title: "Next.js 15 Internals", time: "20 min", xp: "300 XP", cat: "Fullstack" },
          ].map((quiz, i) => (
            <div key={quiz.title} className="group relative rounded-2xl border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-soft hover:shadow-soft-hover transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <span className="px-2 py-0.5 rounded-md bg-surface-container-low text-[10px] font-black uppercase tracking-wider text-primary">
                  {quiz.cat}
                </span>
                <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">auto_awesome</span>
              </div>
              <h4 className="text-[15px] font-bold text-on-surface mb-4 group-hover:text-primary transition-colors">{quiz.title}</h4>
              <div className="flex items-center justify-between pt-4 border-t border-outline-variant/5">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[11px] font-bold text-on-surface-variant/50">
                    <span className="material-symbols-outlined text-[14px]">schedule</span> {quiz.time}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-on-surface-variant/50">
                    <span className="material-symbols-outlined text-[14px]">bolt</span> {quiz.xp}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Category Performance Breakdown */}
      {stats && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border border-outline-variant/10 bg-surface-container-lowest p-8 shadow-soft"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black tracking-tighter text-on-surface">Knowledge Breakdown</h3>
              <p className="text-[13px] font-medium text-on-surface-variant/60 italic pb-2">Analysis of your core technical skills</p>
            </div>
            <div className="bg-primary/5 px-4 py-2 rounded-xl border border-primary/10">
              <p className="text-[10px] font-black text-primary uppercase tracking-widest text-center">Avg. Efficiency</p>
              <p className="text-xl font-black text-primary text-center leading-none mt-1">{stats.averageScore}%</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats.categoryPerformance.map((cat) => (
              <div key={cat.category} className="p-4 rounded-xl border border-outline-variant/5 bg-surface-container-low/30 hover:bg-surface-container-low transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center text-white",
                      cat.percentage >= 80 ? "bg-emerald-500" : cat.percentage >= 60 ? "bg-blue-500" : "bg-amber-500"
                    )}>
                      <span className="material-symbols-outlined text-[18px]">
                        {cat.category === "Backend" ? "dns" : cat.category === "Frontend" ? "web" : "terminal"}
                      </span>
                    </div>
                    <span className="text-[13px] font-bold text-on-surface">{cat.category}</span>
                  </div>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-black tracking-tight",
                    cat.percentage >= 80 ? "bg-emerald-500/10 text-emerald-600" : "bg-primary/10 text-primary"
                  )}>
                    {cat.percentage >= 80 ? "STRONG" : "PROGRESSING"}
                  </span>
                </div>
                <ProgressBar
                  value={cat.percentage}
                  color={cat.percentage >= 80 ? "success" : "primary"}
                  size="sm"
                  className="bg-outline-variant/10"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-[10px] text-on-surface-variant/40 font-bold uppercase tracking-widest">Mastery</span>
                  <span className="text-[11px] font-black text-on-surface">{cat.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
