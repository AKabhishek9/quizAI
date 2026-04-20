"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Medal, Flame, TrendingUp, Search, User } from "lucide-react";
import { getLeaderboard } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LeaderboardUser {
  userId: string;
  name: string;
  totalScore: number;
  totalQuizzes: number;
  avgAccuracy: number;
  level: number;
  rank: number;
}

export default function LeaderboardPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const data = await getLeaderboard();
        // Add rank if doesn't exist
        const rankedData = data.map((u, i) => ({
          ...u,
          rank: i + 1,
        })) as LeaderboardUser[];
        setUsers(rankedData);
      } catch (error) {
        console.error("Failed to load leaderboard:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const topThree = users.slice(0, 3);
  const restOfUsers = filteredUsers; // Show all in the table for now, or slice(3) if preferred. 

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header Section */}
      <div className="flex flex-col gap-2 px-4 md:px-0">
        <h1 className="text-xl font-semibold tracking-tight">Leaderboard</h1>
        <p className="text-muted-foreground text-xs">
          Tracking the top performers of the week. Master the daily challenges to climb.
        </p>
      </div>

      {loading ? (
        <LeaderboardSkeleton />
      ) : (
        <>
          {/* Podium (Top 3) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4 pb-8 px-4 md:px-0">
            {/* Mobile order is natural, Desktop is 2, 1, 3 for visual hierarchy */}
            <div className="block md:hidden space-y-4">
              <PodiumItem user={topThree[0]} position={1} />
              <PodiumItem user={topThree[1]} position={2} />
              <PodiumItem user={topThree[2]} position={3} />
            </div>
            
            <div className="hidden md:contents">
              <PodiumItem user={topThree[1]} position={2} />
              <PodiumItem user={topThree[0]} position={1} />
              <PodiumItem user={topThree[2]} position={3} />
            </div>
          </div>

          {/* Search and Filter */}
          <div className="relative max-w-md mx-auto px-4 md:px-0">
            <Search className="absolute left-7 md:left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* List Section */}
          <div className="px-4 md:px-0">
            <Card className="border-border shadow-sm overflow-hidden bg-card">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                        <th className="px-6 py-4 text-left w-16">Rank</th>
                        <th className="px-6 py-4 text-left">Player</th>
                        <th className="px-6 py-4 text-center">Level</th>
                        <th className="px-6 py-4 text-center">Score</th>
                        <th className="px-6 py-4 text-right">Accuracy</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      <AnimatePresence mode="popLayout">
                        {filteredUsers.map((user, index) => (
                          <motion.tr
                            key={user.userId}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={cn(
                              "hover:bg-primary/[0.02] dark:hover:bg-primary/[0.05] transition-colors group",
                              user.rank <= 3 ? "bg-primary/[0.01]" : ""
                            )}
                          >
                            <td className="px-6 py-4">
                              <span className={cn(
                                "text-sm font-bold tabular-nums",
                                user.rank === 1 ? "text-yellow-500" : 
                                user.rank === 2 ? "text-slate-400" :
                                user.rank === 3 ? "text-amber-600" : "text-muted-foreground"
                              )}>
                                #{user.rank}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8 border border-border">
                                  <AvatarFallback className="text-[10px] font-bold">
                                    {user.name.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-bold tracking-tight">{user.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary text-[10px] font-bold">
                                Lvl {user.level}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex flex-col items-center">
                                <span className="text-sm font-black tabular-nums">{user.totalScore}</span>
                                <span className="text-[10px] text-muted-foreground">{user.totalQuizzes} Quizzes</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5 text-success font-bold text-sm">
                                <TrendingUp className="h-3.5 w-3.5" />
                                {user.avgAccuracy}%
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function PodiumItem({ user, position }: { user?: LeaderboardUser; position: number }) {
  if (!user) return <div className="hidden md:block" />;

  const isFirst = position === 1;
  const config = {
    1: { 
      icon: <Trophy className="h-6 w-6 text-yellow-500" />, 
      color: "border-yellow-500/30 bg-yellow-500/5 dark:bg-yellow-500/10",
      height: "h-48",
      order: "order-2"
    },
    2: { 
      icon: <Medal className="h-6 w-6 text-slate-400" />, 
      color: "border-slate-500/30 bg-slate-500/5 dark:bg-slate-500/10",
      height: "h-40",
      order: "order-1"
    },
    3: { 
      icon: <Medal className="h-6 w-6 text-amber-600" />, 
      color: "border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10",
      height: "h-36",
      order: "order-3"
    }
  }[position as 1 | 2 | 3];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "relative flex flex-col items-center group w-full",
        config.order
      )}
    >
      <div className={cn(
        "w-full flex flex-col items-center justify-end rounded-2xl border p-6 transition-all duration-500 shadow-sm",
        config.color,
        config.height,
        isFirst ? "shadow-lg shadow-yellow-500/10 scale-105 z-10 border-yellow-500/50" : "opacity-80 hover:opacity-100"
      )}>
        {/* Profile */}
        <div className="absolute top-0 -translate-y-1/2 flex flex-col items-center">
          <div className="relative">
            <Avatar className={cn(
              "h-20 w-20 border-4 border-card bg-muted",
              isFirst ? "ring-4 ring-yellow-500/20" : ""
            )}>
              <AvatarFallback className="text-xl font-bold">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className={cn(
              "absolute -bottom-1 -right-1 h-8 w-8 rounded-full border-2 border-card flex items-center justify-center bg-card shadow-sm",
            )}>
              {config.icon}
            </div>
          </div>
        </div>

        <h3 className="text-lg font-black tracking-tight mb-0.5 truncate w-full text-center px-2">{user.name}</h3>
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Level {user.level}</p>
        
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/80 border border-border shadow-inner">
          <span className="text-xl font-black tabular-nums">{user.totalScore}</span>
          <span className="text-[10px] uppercase font-bold text-muted-foreground">Pts</span>
        </div>
      </div>
      
      {/* Rank Badge */}
      <div className={cn(
        "mt-4 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border shadow-sm",
        isFirst ? "bg-yellow-500 text-yellow-950 border-yellow-400" : "bg-card border-border"
      )}>
        Rank #{position}
      </div>
    </motion.div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse px-4 md:px-0">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-48 pt-12">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-muted/50 rounded-2xl border border-border/50 h-36 md:h-full" />
        ))}
      </div>
      <div className="h-64 bg-muted/30 rounded-2xl border border-border/50" />
    </div>
  );
}
