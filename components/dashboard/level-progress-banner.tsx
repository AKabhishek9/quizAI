"use client";

import { motion } from "framer-motion";
import { Sparkles, Trophy, TrendingUp } from "lucide-react";
import { ProgressBar } from "@/components/dashboard/progress-bar";

interface LevelProgressBannerProps {
  profile: {
    level: number;
    xp: number;
    xpToNextLevel: number;
  };
  stats?: {
    currentStreak: number;
  };
}

export function LevelProgressBanner({ profile, stats }: LevelProgressBannerProps) {
  return (
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
            <p className="text-3xl font-black text-foreground leading-none font-heading tracking-tighter italic">{stats?.currentStreak || 0} Day{(stats?.currentStreak !== 1) ? 's' : ''}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
