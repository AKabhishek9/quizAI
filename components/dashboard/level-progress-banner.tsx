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
    <div className="flex flex-col gap-3 card-base p-4 sm:flex-row sm:items-center sm:gap-4">
      {/* Level badge */}
      <div className="flex shrink-0 items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
          L{profile.level}
        </div>
        <div>
          <p className="text-sm font-semibold leading-none text-foreground">
            Level {profile.level}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{xpLeft} XP to next</p>
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
      <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end">
        <p className="text-sm font-semibold tabular-nums text-foreground">
          {profile.xp.toLocaleString()}{" "}
          <span className="text-muted-foreground">/ {profile.xpToNextLevel.toLocaleString()} XP</span>
        </p>
        {stats !== undefined && (
          <div className="flex items-center gap-1.5 text-primary">
            <TrendingUp className="h-3.5 w-3.5" />
            <span className="text-sm font-medium tabular-nums">{stats.currentStreak}d</span>
          </div>
        )}
      </div>
    </div>
  );
}
