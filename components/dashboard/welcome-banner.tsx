"use client";

import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomeBannerProps {
  profile?: {
    name: string;
    xp?: number;
  };
  stats?: {
    currentStreak: number;
  };
}

export function WelcomeBanner({ profile, stats }: WelcomeBannerProps) {
  const firstName = profile?.name?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-xl card-base">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight font-heading">
          {greeting}, {firstName}
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5 flex items-center gap-2">
          {stats?.currentStreak !== undefined && (
            <span className="flex items-center gap-1 font-medium text-foreground">
              <Flame className="w-4 h-4 text-warning fill-warning" />
              {stats.currentStreak} day streak
            </span>
          )}
          {stats?.currentStreak !== undefined && profile?.xp !== undefined && (
            <span className="text-border">/</span>
          )}
          {profile?.xp !== undefined && (
            <span>{profile.xp.toLocaleString()} XP earned</span>
          )}
          {!stats && !profile?.xp && (
            <span>Ready to level up your skills?</span>
          )}
        </p>
      </div>
      <div>
        <Button render={<Link href="/quiz" />} size="lg" className="inline-flex items-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer">
          Start Quiz
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
