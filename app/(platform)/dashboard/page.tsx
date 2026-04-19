"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Trophy, 
  TrendingUp, 
  ArrowRight, 
  Zap,
  Target,
  Sparkles,
  LucideIcon 
} from "lucide-react";
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
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-10 pt-4"
      >
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-black tracking-[0.2em] text-primary uppercase">Telemetry Active</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-foreground font-heading">
            {profile ? `Good Evening, ${profile.name.split(" ")[0]}` : "Scholar Dashboard"}
          </h1>
          <p className="text-[17px] font-bold text-muted-foreground/60 tracking-tight max-w-xl leading-relaxed">
            You're currently outperforming <span className="text-primary">96% of scholars</span> in conceptual mastery this week.
          </p>
        </div>
        
        <Link href="/quiz">
          <Button className="h-16 px-12 rounded-full bg-primary hover:bg-primary/90 transition-all shadow-glow-primary border-0 text-primary-foreground font-black tracking-tighter text-lg cursor-pointer group active:scale-[0.98]">
            Initiate Assessment
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </motion.div>

      {/* Stats Grid */}
      {isLoading ? (
        <SkeletonStatsGrid />
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <StatsCard
            title="Knowledge Sessions"
            value={stats.totalQuizzes}
            icon={BookOpen as unknown as LucideIcon}
            variant="blue"
            trend={{ value: 12, isPositive: true }}
            description="Total assessments successfully completed."
          />
          <StatsCard
            title="Mastery Average"
            value={`${stats.averageScore}%`}
            icon={Target as unknown as LucideIcon}
            variant="green"
            trend={{ value: 5, isPositive: true }}
            description="Global accuracy across your entire journey."
          />
          <StatsCard
            title="Elite Ranking"
            value={`#${stats.rank}`}
            total="2.4k"
            icon={Trophy as unknown as LucideIcon}
            variant="orange"
            description="Your current position in the world hierarchy."
          />
        </div>
      ) : null}

      {/* Level Progress Banner */}
      {profile && (
        <motion.div
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-[40px] border border-border/40 bg-card/30 p-12 whisper-shadow backdrop-blur-xl group hover:bg-card/40 transition-all duration-500"
        >
          <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-all duration-700 -rotate-12 group-hover:rotate-0">
            <Sparkles className="h-40 w-40 text-primary" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-shrink-0 relative">
              <div className="w-24 h-24 rounded-[32px] bg-primary/10 flex items-center justify-center border-4 border-background shadow-soft group-hover:scale-105 transition-transform">
                <Trophy className="text-primary h-12 w-12" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-foreground text-background text-[11px] font-black px-4 py-1.5 rounded-full shadow-soft border-2 border-background">
                Lv. {profile.level}
              </div>
            </div>
            
            <div className="flex-1 w-full space-y-5">
              <div className="flex items-end justify-between">
                <div className="space-y-2">
                  <h4 className="text-2xl font-black tracking-tighter text-foreground font-heading uppercase italic group-hover:not-italic transition-all">Scholar Progression</h4>
                  <p className="text-[14px] text-muted-foreground font-bold tracking-tight opacity-70">
                    Next Tier: High-Performance Engine • {profile.xpToNextLevel - profile.xp} XP to unlock
                  </p>
                </div>
                <div className="text-right pb-1">
                  <span className="text-3xl font-black tracking-tighter text-primary font-heading leading-none block">{profile.xp}</span>
                  <span className="text-[13px] font-bold text-muted-foreground/40 tracking-tight uppercase">Total XP Calibrated</span>
                </div>
              </div>
              <ProgressBar
                value={(profile.xp / profile.xpToNextLevel) * 100}
                showPercentage={false}
                size="md"
                className="bg-muted h-3.5 rounded-full overflow-hidden"
              />
            </div>

            <div className="hidden lg:block w-px h-20 bg-border/20 mx-4" />

            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/10 shadow-soft">
                <TrendingUp className="text-primary h-8 w-8" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 leading-none mb-2">Streak Index</p>
                <p className="text-3xl font-black text-foreground leading-none font-heading tracking-tighter italic">4 Days</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Chart + Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
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
      {stats && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-[40px] border border-border/40 bg-card/30 p-12 whisper-shadow backdrop-blur-xl group hover:bg-card/40 transition-colors"
        >
          <div className="flex items-center justify-between mb-16">
            <div className="space-y-2">
              <h3 className="text-3xl font-black tracking-tighter text-foreground font-heading uppercase italic group-hover:not-italic transition-all">Skill Equilibrium</h3>
              <p className="text-[15px] text-muted-foreground font-bold tracking-tight opacity-60">Deep-learning telemetry of your conceptual mastery</p>
            </div>
            <div className="text-right space-y-1">
              <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.25em] leading-none mb-2">Composite Mastery</p>
              <div className="flex items-center justify-end gap-3 text-5xl font-black text-primary font-heading tracking-tighter">
                {stats.averageScore}%
                <Sparkles className="h-6 w-6 fill-current text-primary animate-pulse" />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
            {stats.categoryPerformance.map((cat) => (
              <div key={cat.category} className="space-y-5 group/item">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center border border-border/40 group-hover/item:bg-primary/10 group-hover/item:border-primary/20 group-hover/item:scale-110 transition-all duration-500">
                      <span className="material-symbols-outlined text-[20px] text-muted-foreground group-hover/item:text-primary transition-colors">
                        {cat.category === "Backend" ? "dns" : cat.category === "Frontend" ? "web" : "terminal"}
                      </span>
                    </div>
                    <span className="text-[16px] font-black tracking-tight text-foreground">{cat.category}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[15px] font-black tracking-tighter text-foreground">{cat.percentage}%</span>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border",
                      cat.percentage >= 80 
                        ? "bg-primary/10 text-primary border-primary/20" 
                        : "bg-muted text-muted-foreground/40 border-border/40"
                    )}>
                      {cat.percentage >= 80 ? "Optimized" : "Calibrating"}
                    </span>
                  </div>
                </div>
                <ProgressBar
                  value={cat.percentage}
                  color={cat.percentage >= 80 ? "primary" : "neutral"}
                  size="sm"
                  className="bg-muted h-2.5 rounded-full overflow-hidden"
                />
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
