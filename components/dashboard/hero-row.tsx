"use client";

import Link from "next/link";
import { ArrowRight, Flame, Star } from "lucide-react";

interface HeroRowProps {
  profile?: {
    name: string;
    level: number;
    xp: number;
    xpToNextLevel: number;
  };
  stats?: {
    currentStreak: number;
  };
}

export function HeroRow({ profile, stats }: HeroRowProps) {
  const firstName = profile?.name?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const level = profile?.level ?? 1;
  const xp = profile?.xp ?? 0;
  const xpToNext = profile?.xpToNextLevel ?? 100;
  const pct = Math.min(100, Math.round((xp / xpToNext) * 100));
  const xpLeft = xpToNext - xp;
  const streak = stats?.currentStreak ?? 0;

  // SVG ring geometry
  const R = 22;
  const C = 2 * Math.PI * R;
  const offset = C - (pct / 100) * C;

  return (
    <div className="card-base flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4">
      {/* ── Left: Greeting + badges ── */}
      <div className="flex-1 min-w-0">
        <h1 className="font-heading text-base font-bold tracking-tight text-foreground sm:text-lg leading-tight">
          {greeting}, {firstName}{" "}
          <span aria-hidden="true" className="inline-block">👋</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Keep learning, keep growing.
        </p>
        <div className="flex items-center gap-3 mt-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
            <Flame className="h-3 w-3" />
            {streak}d streak
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
            <Star className="h-3 w-3" />
            {xp.toLocaleString()} XP earned
          </span>
        </div>
      </div>

      {/* ── Center: Level ring + XP bar ── */}
      {profile && (
        <div className="flex items-center gap-3 shrink-0">
          {/* Circular level ring */}
          <div className="relative flex items-center justify-center">
            <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90">
              <circle
                cx="28" cy="28" r={R}
                fill="none"
                stroke="var(--border)"
                strokeWidth="3"
              />
              <circle
                cx="28" cy="28" r={R}
                fill="none"
                stroke="var(--primary)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={offset}
                className="transition-[stroke-dashoffset] duration-700 ease-out"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">
              {level}
            </span>
          </div>

          <div className="min-w-[120px]">
            <p className="text-[11px] text-muted-foreground leading-none">
              {xpLeft} XP to next level
            </p>
            {/* XP bar */}
            <div className="mt-1.5 h-1.5 w-full rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-[10px] tabular-nums text-muted-foreground mt-1">
              {xp.toLocaleString()} / {xpToNext.toLocaleString()} XP
            </p>
          </div>
        </div>
      )}

      {/* ── Right: Start Quiz CTA ── */}
      <Link
        href="/quiz"
        className="group relative overflow-hidden flex items-center gap-3 rounded-xl bg-primary/10 border border-primary/20 px-4 py-3 transition-colors hover:bg-primary/15 shrink-0 cursor-pointer"
      >
        {/* Shimmer reflection */}
        <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/30 to-transparent w-1/2 h-full skew-x-[-15deg] animate-shimmer-fast pointer-events-none" />

        <div className="min-w-0 relative z-10">
          <p className="text-sm font-semibold text-foreground leading-tight">Start Quiz</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Let&apos;s test your knowledge
          </p>
        </div>
        <ArrowRight className="h-4 w-4 text-primary shrink-0 relative z-10 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}
