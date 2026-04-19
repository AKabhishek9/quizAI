"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Trophy, 
  Target, 
  Loader2, 
  Sparkles, 
  TrendingUp,
  Award,
  Zap,
  ChevronRight
} from "lucide-react";
import { getLeaderboard } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";

interface LeaderboardUser {
  userId: string;
  name: string;
  level: number;
  totalScore: number;
  avgAccuracy: number;
  totalQuizzes: number;
}

export default function LeaderboardPage() {
  const { user: currentUser } = useAuth();
  const [data, setData] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const result = await getLeaderboard();
        const normalized: LeaderboardUser[] = (result || []).map((r: Record<string, unknown>) => ({
          userId: String(r.userId ?? r.id ?? ""),
          name: String(r.name ?? "Scholar"),
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
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-8">
        <div className="relative">
          <div className="h-20 w-20 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
          <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
        </div>
        <p className="text-[14px] font-black tracking-[0.2em] text-muted-foreground uppercase opacity-60 animate-pulse">
          Synchronizing Global Telemetry...
        </p>
      </div>
    );
  }

  const topThree = data.slice(0, 3);
  const others = data.slice(3);
  const currentUserRank = data.findIndex(u => u.userId === currentUser?.uid) + 1;

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-20">
      {/* Header */}
      <div className="text-center space-y-6 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary mb-2">
          <Award className="h-3 w-3" />
          <span className="text-[10px] font-black tracking-[0.2em] uppercase">Global Hierarchy</span>
        </div>
        <h1 className="text-6xl font-black tracking-tighter text-foreground font-heading uppercase italic">
          Hall of Excellence
        </h1>
        <p className="text-[17px] font-bold text-muted-foreground/60 tracking-tight leading-relaxed">
          The definitive ranking of scholars based on conceptual mastery, accuracy, and calibrated consistency.
        </p>
      </div>

      {/* Top 3 Podium - Refined Tonal Look */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-end max-w-4xl mx-auto px-4">
        {topThree.map((user, idx) => {
          const rank = idx + 1;
          const isFirst = rank === 1;
          const isSecond = rank === 2;
          
          return (
            <motion.div
              key={user.userId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              className={cn(
                "relative flex flex-col items-center p-10 rounded-[40px] border transition-all duration-500 hover:scale-[1.05] shadow-2xl backdrop-blur-xl group",
                isFirst ? "order-1 md:order-2 border-primary/30 bg-primary/5 md:-mt-12 md:pb-16 whisper-shadow" : 
                isSecond ? "order-2 md:order-1 border-border/40 bg-card/40" : 
                "order-3 border-border/40 bg-card/40"
              )}
            >
              {/* Rank Badge */}
              <div className={cn(
                "absolute -top-5 w-12 h-12 rounded-2xl flex items-center justify-center text-[15px] font-black shadow-soft border-4 border-background transition-transform group-hover:-translate-y-1",
                isFirst ? "bg-primary text-primary-foreground" : "bg-foreground text-background"
              )}>
                {rank}
              </div>

              {/* Avatar Circle */}
              <div className="relative mb-8">
                <div className={cn(
                   "w-24 h-24 rounded-[32px] bg-background flex items-center justify-center border-4 border-muted shadow-soft overflow-hidden transition-all duration-500",
                   isFirst ? "ring-2 ring-primary/40 scale-110" : "group-hover:border-primary/20"
                )}>
                   <span className="text-3xl font-black text-muted-foreground/40 group-hover:text-primary transition-colors">
                      {user.name.substring(0, 1).toUpperCase()}
                   </span>
                </div>
                {isFirst && (
                  <div className="absolute -bottom-2 -right-2 bg-primary rounded-full p-2 shadow-soft border-2 border-background">
                    <Sparkles className="h-4 w-4 text-primary-foreground fill-current" />
                  </div>
                )}
              </div>

              <h2 className="text-xl font-black text-foreground tracking-tighter mb-1 truncate w-full text-center font-heading">
                {user.name}
              </h2>
              <div className="flex items-center gap-2 mb-8">
                <span className="text-[11px] font-black text-primary uppercase tracking-[0.25em] opacity-80 italic">
                  Level {user.level} Scholar
                </span>
              </div>

              <div className="grid grid-cols-2 gap-8 w-full pt-8 border-t border-border/10">
                <div className="text-center group/stat">
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40 mb-1 group-hover/stat:opacity-80 transition-opacity">Index</p>
                  <p className="text-2xl font-black tracking-tighter text-foreground font-heading italic">{user.totalScore.toLocaleString()}</p>
                </div>
                <div className="text-center group/stat">
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40 mb-1 group-hover/stat:opacity-80 transition-opacity">Accuracy</p>
                  <p className="text-2xl font-black tracking-tighter text-foreground font-heading italic">{user.avgAccuracy}%</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Rankings List - No Line Rule Applied */}
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between px-10 mb-4">
          <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground/40 italic">Sequential Telemetry</h3>
          {currentUserRank > 0 && (
             <span className="text-[11px] font-black tracking-widest text-primary bg-primary/5 px-4 py-1.5 rounded-full border border-primary/20 uppercase">
               Your Metric: Rank #{currentUserRank}
             </span>
          )}
        </div>

        <div className="bg-card/30 rounded-[40px] border border-border/40 overflow-hidden whisper-shadow backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted/30">
                  <th className="px-10 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Position</th>
                  <th className="px-10 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Scholar</th>
                  <th className="px-10 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Calibration Stats</th>
                  <th className="px-10 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 text-right">Composite Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/5">
                {others.map((user, idx) => {
                  const isCurrentUser = user.userId === currentUser?.uid;
                  return (
                    <motion.tr 
                      key={user.userId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: (idx + 3) * 0.05 }}
                      className={cn(
                        "hover:bg-muted/40 transition-all group",
                        isCurrentUser ? "bg-primary/[0.04]" : ""
                      )}
                    >
                      <td className="px-10 py-8">
                        <span className="text-[14px] font-black text-muted-foreground/40 group-hover:text-foreground transition-colors italic">
                          {idx + 4}
                        </span>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center text-[12px] font-black text-foreground shadow-soft border border-border/10 group-hover:bg-background group-hover:border-primary/30 transition-all duration-500">
                            {user.name.substring(0, 1).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[16px] font-black tracking-tight text-foreground transition-colors group-hover:translate-x-0.5 duration-300">{user.name}</span>
                            <span className="text-[11px] font-bold text-primary opacity-70 tracking-tight italic">Level {user.level} Elite Scholar</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-10">
                          <div className="flex flex-col">
                             <span className="text-[14px] font-black text-foreground tracking-tighter">{user.avgAccuracy}%</span>
                             <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Accuracy</span>
                          </div>
                          <div className="flex flex-col">
                             <span className="text-[14px] font-black text-foreground tracking-tighter">{user.totalQuizzes}</span>
                             <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Sessions</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <div className="inline-flex items-center gap-4">
                           <div className="flex flex-col items-end">
                              <span className="text-2xl font-black tracking-tighter text-foreground font-heading italic group-hover:not-italic transition-all">
                                {user.totalScore.toLocaleString()}
                              </span>
                           </div>
                           <ChevronRight className="h-5 w-5 text-muted-foreground/20 group-hover:text-primary transition-all group-hover:translate-x-1" />
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
