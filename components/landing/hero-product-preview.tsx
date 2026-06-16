"use client";

import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Flame,
  TrendingUp,
  Trophy,
  ArrowRight,
  BarChart3,
} from "lucide-react";

/* ─────────────────────────────────────────────
 *  Hero Product Preview
 *
 *  A decorative dashboard mockup matching the
 *  reference design. Static visuals only.
 * ───────────────────────────────────────────── */

const STATS = [
  { label: "Quizzes Completed", value: "15", change: "↑ 10%", positive: true },
  { label: "Average Score", value: "58%", change: "↑ 8%", positive: true },
  { label: "Current Streak", value: "1d", change: "Keep it going!", positive: true },
  { label: "Ranking", value: "#1", change: "Top 1%", positive: true },
];

/* SVG performance chart points */
const CHART_POINTS = [
  { x: 0, y: 65 },
  { x: 1, y: 55 },
  { x: 2, y: 70 },
  { x: 3, y: 45 },
  { x: 4, y: 60 },
  { x: 5, y: 35 },
  { x: 6, y: 50 },
  { x: 7, y: 30 },
  { x: 8, y: 40 },
  { x: 9, y: 25 },
];

function buildPath(points: { x: number; y: number }[], width: number, height: number) {
  const xStep = width / (points.length - 1);
  return points
    .map((p, i) => {
      const x = i * xStep;
      const y = (p.y / 100) * height;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

export function HeroProductPreview() {
  const chartW = 320;
  const chartH = 80;
  const linePath = buildPath(CHART_POINTS, chartW, chartH);
  const areaPath = `${linePath} L ${chartW} ${chartH} L 0 ${chartH} Z`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: 0 }}
      animate={{ opacity: 1, y: 0, rotate: 1 }}
      transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-md mx-auto lg:mx-0"
    >
      {/* Glow behind the card */}
      <div
        className="absolute -inset-6 rounded-3xl blur-3xl pointer-events-none opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at center, color-mix(in oklch, var(--primary) 15%, transparent), transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Main card */}
      <div className="relative rounded-2xl overflow-hidden card-base shadow-2xl shadow-black/20 dark:shadow-black/40">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary/15 flex items-center justify-center">
              <LayoutDashboard className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground tracking-wide">
              Dashboard
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Flame className="h-3 w-3 text-primary" />
            <span className="font-medium">1 day streak</span>
          </div>
        </div>

        <div className="px-5 pb-4 space-y-4">
          {/* Greeting */}
          <div>
            <p className="text-base font-bold text-foreground tracking-tight font-heading">
              Good evening, Abhishek 👋
            </p>
          </div>

          {/* Level / XP / Action row */}
          <div className="flex items-center gap-3">
            {/* Level badge */}
            <div className="flex items-center justify-center h-11 w-11 rounded-xl bg-muted border border-border">
              <div className="text-center">
                <span className="text-[9px] text-muted-foreground leading-none block">Level</span>
                <span className="text-sm font-bold text-foreground leading-none">8</span>
              </div>
            </div>

            {/* XP */}
            <div className="flex-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-foreground tabular-nums">750</span>
                <span className="text-[10px] text-muted-foreground font-medium">/ 800 xp</span>
              </div>
              <div className="mt-1 h-1.5 bg-muted/60 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "93.75%" }}
                  transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Start Quiz button */}
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[11px] font-semibold transition-colors hover:bg-primary-hover shrink-0">
              Start Quiz
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-2">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="p-2 rounded-lg bg-muted/30 border border-border/50 text-center"
              >
                <p className="text-[8px] text-muted-foreground leading-tight mb-1 truncate">
                  {stat.label}
                </p>
                <p className="text-sm font-bold text-foreground tabular-nums">{stat.value}</p>
                <p className="text-[8px] text-primary font-medium mt-0.5">{stat.change}</p>
              </div>
            ))}
          </div>

          {/* Performance Trend chart */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                <BarChart3 className="h-3 w-3 text-primary" />
                Performance Trend
              </span>
              <span className="text-[9px] text-muted-foreground">Last 10 sessions →</span>
            </div>
            <div className="rounded-lg bg-muted/20 border border-border/30 p-2 overflow-hidden">
              <svg
                viewBox={`0 0 ${chartW} ${chartH}`}
                className="w-full h-auto"
                preserveAspectRatio="none"
              >
                {/* Area fill */}
                <motion.path
                  d={areaPath}
                  fill="url(#chartGradient)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  transition={{ duration: 1.5, delay: 1 }}
                />
                {/* Line */}
                <motion.path
                  d={linePath}
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 2, delay: 0.8, ease: "easeOut" }}
                />
                {/* Gradient definition */}
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
