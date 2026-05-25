"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Globe,
  Zap,
  Calculator,
  Flame,
  BarChart3,
  Trophy,
  Clock,
  CheckCircle2,
  Circle,
} from "lucide-react";

/* ─────────────────────────────────────────────
 *  Hero Product Preview
 *
 *  A purely decorative, self-contained dashboard
 *  mockup rendered in React. Zero real data, zero
 *  API calls — static visuals only.
 * ───────────────────────────────────────────── */

const CATEGORIES = [
  { name: "General Knowledge", pct: 82, icon: Globe },
  { name: "Tech", pct: 74, icon: Brain },
  { name: "Aptitude", pct: 68, icon: Zap },
  { name: "Mathematics", pct: 91, icon: Calculator },
];

const QUESTS = [
  { label: "General Knowledge", qs: 10, icon: Globe },
  { label: "Tech", qs: 10, icon: Brain },
  { label: "Aptitude", qs: 10, icon: Zap },
  { label: "Maths", qs: 10, icon: Calculator },
];

const ACTIVITIES = [
  {
    title: "Data Structures Quiz",
    status: "Completed quiz",
    dot: "bg-primary text-primary-foreground",
  },
  {
    title: "General Knowledge",
    status: "Completed quiz",
    dot: "bg-success text-success-foreground",
  },
  {
    title: "React Fundamentals",
    status: "Mixed",
    dot: "bg-warning text-warning-foreground",
  },
];

export function HeroProductPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative mt-20 w-full max-w-5xl mx-auto px-4"
    >
      {/* Glow behind the card */}
      <div className="absolute -inset-6 rounded-3xl bg-primary/[0.03] blur-3xl pointer-events-none" />

      {/* Browser frame — glassmorphic */}
      <div className="relative rounded-2xl border border-border/50 bg-card/70 backdrop-blur-md shadow-2xl shadow-black/10 overflow-hidden">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/40 bg-card/50">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-destructive/50" />
            <span className="h-2.5 w-2.5 rounded-full bg-warning/50" />
            <span className="h-2.5 w-2.5 rounded-full bg-success/50" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="h-5 w-48 rounded-md bg-muted/40 flex items-center justify-center">
              <span className="text-[9px] text-muted-foreground tracking-wide select-none">
                quizai.app/dashboard
              </span>
            </div>
          </div>
          <div className="w-12" />
        </div>

        {/* Dashboard content */}
        <div className="p-4 md:p-6 space-y-4 bg-background/40">
          {/* ── Row 1: Welcome + stats ── */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <p className="text-lg md:text-xl font-bold text-foreground tracking-tight font-heading">
                Good morning, Alex 👋
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                You&apos;ve completed 12 quizzes this week
              </p>
            </div>
            <div className="flex gap-2">
              {[
                { label: "Streak", value: "7 days", icon: Flame },
                { label: "Level", value: "14", icon: Trophy },
                { label: "XP", value: "2,840", icon: BarChart3 },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-card/50 border border-border/40"
                >
                  <s.icon className="h-3 w-3 text-primary" />
                  <span className="text-[10px] font-semibold text-foreground tabular-nums">
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Row 2: Main grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Daily Quests panel */}
            <div className="border border-border/40 rounded-xl bg-card/50 p-3.5 flex flex-col gap-2.5">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-medium text-foreground">
                  Daily Quests
                </span>
                <span className="ml-auto text-[9px] text-muted-foreground flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5" /> 18h 24m
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {QUESTS.map((q) => (
                  <div
                    key={q.label}
                    className="flex flex-col gap-1 p-2 rounded-lg bg-muted/20 border border-border/20 hover:bg-muted/30 transition-colors"
                  >
                    <q.icon className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[11px] font-medium text-foreground leading-tight">
                      {q.label}
                    </span>
                    <span className="text-[9px] text-muted-foreground">
                      {q.qs} questions
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Breakdown panel */}
            <div className="border border-border/40 rounded-xl bg-card/50 p-3.5 flex flex-col gap-2.5">
              <span className="text-xs font-medium text-foreground">
                Category Breakdown
              </span>
              <div className="space-y-2.5">
                {CATEGORIES.map((cat) => (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium text-foreground flex items-center gap-1.5">
                        <cat.icon className="h-2.5 w-2.5 text-muted-foreground" />
                        {cat.name}
                      </span>
                      <span className="text-[9px] text-muted-foreground tabular-nums">
                        {cat.pct}%
                      </span>
                    </div>
                    <div className="h-1 bg-muted/40 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${cat.pct}%` }}
                        transition={{
                          duration: 1,
                          delay: 0.8,
                          ease: "easeOut",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity panel */}
            <div className="border border-border/40 rounded-xl bg-card/50 p-3.5 flex flex-col gap-2">
              <span className="text-xs font-medium text-foreground">
                Recent Activity
              </span>
              {ACTIVITIES.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 py-1.5 border-b border-border/30 last:border-0"
                >
                  <div
                    className={`h-6 w-6 rounded-md shrink-0 flex items-center justify-center text-[8px] font-bold ${a.dot}`}
                  >
                    {a.title[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium text-foreground truncate leading-tight">
                      {a.title}
                    </p>
                    <p className="text-[9px] text-muted-foreground">
                      {a.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Row 3: Mini quiz player teaser ── */}
          <div className="border border-border/40 rounded-xl bg-card/50 p-3.5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-md bg-primary/10 flex items-center justify-center">
                  <Brain className="h-3 w-3 text-primary" />
                </div>
                <span className="text-xs font-medium text-foreground">
                  React Fundamentals
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted/40 text-muted-foreground font-medium">
                  Q3 / 10
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
                <Clock className="h-2.5 w-2.5" />
                <span className="tabular-nums">0:24</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-muted/30 rounded-full overflow-hidden mb-3">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: "30%" }}
                transition={{ duration: 1, delay: 1.2, ease: "easeOut" }}
              />
            </div>

            {/* Question */}
            <p className="text-[11px] font-medium text-foreground mb-2.5 leading-relaxed">
              Which hook is used to perform side effects in a functional React
              component?
            </p>

            {/* Answer options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {[
                { label: "A", text: "useState", selected: false },
                { label: "B", text: "useEffect", selected: true },
                { label: "C", text: "useContext", selected: false },
                { label: "D", text: "useReducer", selected: false },
              ].map((opt) => (
                <div
                  key={opt.label}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] border transition-colors ${
                    opt.selected
                      ? "border-primary/40 bg-primary/5 text-foreground"
                      : "border-border/30 bg-muted/10 text-muted-foreground"
                  }`}
                >
                  {opt.selected ? (
                    <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />
                  ) : (
                    <Circle className="h-3 w-3 text-muted-foreground/30 shrink-0" />
                  )}
                  <span className="font-medium">{opt.label}.</span>
                  <span>{opt.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
