"use client";

import { ProgressBar } from "@/components/dashboard/progress-bar";
import { TrendingUp } from "lucide-react";

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
  const pct = Math.min(100, Math.round((profile.xp / profile.xpToNextLevel) * 100));
  const xpLeft = profile.xpToNextLevel - profile.xp;

  return (
    <div className="border border-border rounded-lg p-4 bg-card flex flex-col sm:flex-row sm:items-center gap-4">
      {/* Level badge */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary text-xs font-semibold">
          L{profile.level}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground leading-none">Level {profile.level}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{xpLeft} XP to next</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex-1">
        <ProgressBar
          value={pct}
          showPercentage={false}
          size="sm"
          className="h-1.5"
        />
      </div>

      {/* XP + Streak */}
      <div className="flex items-center gap-4 shrink-0 text-right">
        <div>
          <p className="text-sm font-semibold tabular-nums text-foreground">{profile.xp.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Total XP</p>
        </div>
        {stats !== undefined && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5" />
            <span className="text-sm font-medium tabular-nums">{stats.currentStreak}d</span>
          </div>
        )}
      </div>
    </div>
  );
}
