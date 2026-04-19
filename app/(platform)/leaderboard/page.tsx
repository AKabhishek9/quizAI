"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Target, BookOpen, Loader2, Sparkles, TrendingUp } from "lucide-react";
import { getLeaderboard } from "@/lib/api";
import { cn } from "@/lib/utils";

interface LeaderboardUser {
  userId: string;
  name: string;
  level: number;
  totalScore: number;
  avgAccuracy: number;
  totalQuizzes: number;
}

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const result = await getLeaderboard();
        const normalized: LeaderboardUser[] = (result || []).map((r: Record<string, unknown>) => ({
          userId: String(r.userId ?? r.id ?? ""),
          name: String(r.name ?? "Unknown"),
          level: Number(r.level ?? 1),
          totalScore: Number(r.totalScore ?? r.points ?? 0),
          avgAccuracy: Number(r.avgAccuracy ?? r.accuracy ?? 0),
          totalQuizzes: Number(r.totalQuizzes ?? r.quizzes ?? 0),
        }));
        setData(normalized);
      } catch (err) {
        console.error("Failed to load leaderboard:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm font-medium text-muted-foreground">Aggregating global statistics...</p>
      </div>
    );
  }

  const topThree = data.slice(0, 3);
  const others = data.slice(3);

  return (
    <div className="max-w-4xl mx-auto pb-20 px-4 pt-4">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-4">
          <Sparkles className="h-3 w-3" />
          Global Rankings
        </div>
        <h1 className="text-4xl font-black tracking-tighter mb-2">Hall of Excellence</h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          The top performers across {data.length} scholars based on accuracy and assessment consistency.
        </p>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {topThree.map((user, idx) => {
          const rank = idx + 1;
          const isGold = rank === 1;
          const isSilver = rank === 2;
          const isBronze = rank === 3;

          return (
            <motion.div
              key={user.userId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                "relative group flex flex-col items-center p-8 rounded-2xl border bg-card elevated transition-all hover:scale-[1.02]",
                isGold ? "border-yellow-500/30 md:-mt-4 md:mb-4 bg-gradient-to-b from-yellow-500/5 to-transparent" :
                isSilver ? "border-slate-400/30" : "border-amber-600/30"
              )}
            >
              <div className={cn(
                "absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ring-4 ring-background",
                isGold ? "bg-yellow-500" : isSilver ? "bg-slate-400" : "bg-amber-600"
              )}>
                {rank}
              </div>

              <div className="relative mb-4">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center border-2 border-border overflow-hidden">
                   <UserAvatar name={user.name} />
                </div>
                {isGold && <Medal className="absolute -bottom-1 -right-1 h-5 w-5 text-yellow-500" />}
              </div>

              <h2 className="text-base font-bold text-foreground mb-1 mt-1 truncate w-full text-center">
                {user.name}
              </h2>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Level {user.level}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full pt-4 border-t border-border/50">
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight mb-0.5">Points</p>
                  <p className="text-lg font-black tracking-tight">{user.totalScore.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight mb-0.5">Avg %</p>
                  <p className="text-lg font-black tracking-tight">{user.avgAccuracy}%</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Rankings List */}
      <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-md overflow-hidden elevated">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Rank</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Scholar</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">Level</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">Quizzes</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right font-black">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {others.map((user, idx) => (
              <motion.tr 
                key={user.userId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: (idx + 3) * 0.05 }}
                className="hover:bg-accent/40 transition-colors group"
              >
                <td className="px-6 py-4 font-bold text-sm text-muted-foreground">{idx + 4}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold ring-1 ring-border group-hover:ring-primary/20 transition-all">
                      {user.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{user.name}</p>
                      <p className="text-[10px] text-muted-foreground font-medium">{user.avgAccuracy}% Accuracy</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-xs font-bold text-muted-foreground">Lvl {user.level}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-xs font-medium">{user.totalQuizzes}</span>
                </td>
                <td className="px-6 py-4 text-right">
                   <div className="inline-flex items-center gap-1 text-sm font-black tracking-tight text-primary">
                      {user.totalScore.toLocaleString()}
                   </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UserAvatar({ name }: { name: string }) {
    return (
        <span className="text-xl font-black text-muted-foreground">
            {name.substring(0, 2).toUpperCase()}
        </span>
    );
}
