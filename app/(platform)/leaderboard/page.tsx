"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Medal, TrendingUp, Search } from "lucide-react";
import { getLeaderboard } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";

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
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const data = await getLeaderboard();
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

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">Leaderboard</h1>
        <p className="text-sm text-muted-foreground">Top performers this week.</p>
      </div>

      {loading ? (
        <LeaderboardSkeleton />
      ) : (
        <>
          {/* Podium (Top 3) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-2 pb-6">
            {/* Mobile: horizontal scroll */}
            <div className="flex md:hidden overflow-x-auto gap-4 pb-4 snap-x">
              <div className="min-w-[200px] snap-center">
                <PodiumItem user={topThree[0]} position={1} />
              </div>
              <div className="min-w-[180px] snap-center">
                <PodiumItem user={topThree[1]} position={2} />
              </div>
              <div className="min-w-[180px] snap-center">
                <PodiumItem user={topThree[2]} position={3} />
              </div>
            </div>

            {/* Desktop: 2, 1, 3 visual hierarchy */}
            <div className="hidden md:contents">
              <PodiumItem user={topThree[1]} position={2} />
              <PodiumItem user={topThree[0]} position={1} />
              <PodiumItem user={topThree[2]} position={3} />
            </div>
          </div>

          {/* Search — full width */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-11 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Table */}
          <Card className="border-border shadow-sm overflow-hidden bg-card">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px]">
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
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-sm text-muted-foreground">
                            No users found matching &quot;{searchTerm}&quot;
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user, index) => (
                          <motion.tr
                            key={user.userId}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.04 }}
                            className={cn(
                              "hover:bg-primary/[0.03] transition-colors",
                              user.rank === 1 && "bg-warning/[0.03]",
                              user.userId === currentUser?.uid && "bg-primary/5 border-l-2 border-primary"
                            )}
                          >
                          {/* Rank */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {user.rank === 1 ? (
                                <span className="w-6 h-6 rounded-full bg-warning/20 text-warning text-xs font-black flex items-center justify-center">1</span>
                              ) : user.rank === 2 ? (
                                <span className="w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-black flex items-center justify-center">2</span>
                              ) : user.rank === 3 ? (
                                <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-black flex items-center justify-center">3</span>
                              ) : (
                                <span className="text-sm font-bold text-muted-foreground tabular-nums">
                                  {user.rank}
                                </span>
                              )}
                            </div>
                          </td>
                          {/* Player */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8 border border-border">
                                <AvatarFallback className="text-[10px] font-bold">
                                  {user.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-semibold tracking-tight">{user.name}</span>
                            </div>
                          </td>
                          {/* Level */}
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                              Lvl {user.level}
                            </span>
                          </td>
                          {/* Score */}
                          <td className="px-6 py-4 text-center">
                            <div className="flex flex-col items-center">
                              <span className="text-sm font-bold tabular-nums">{user.totalScore}</span>
                              <span className="text-[10px] text-muted-foreground">{user.totalQuizzes} {user.totalQuizzes === 1 ? "Quiz" : "Quizzes"}</span>
                            </div>
                          </td>
                          {/* Accuracy */}
                          <td className="px-6 py-4 text-right">
                            <div className={cn("flex items-center justify-end gap-1.5 font-bold text-sm",
                              user.avgAccuracy >= 70 ? "text-success" : 
                              user.avgAccuracy >= 50 ? "text-warning" : "text-destructive"
                            )}>
                              <TrendingUp className="h-3.5 w-3.5" />
                              {user.avgAccuracy}%
                            </div>
                          </td>
                        </motion.tr>
                      )))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
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
      icon: <Trophy className="h-5 w-5 text-warning" />,
      cardColor: "border-warning/30 bg-warning/5",
      badgeColor: "bg-warning/20 text-warning border-warning/30",
      avatarRing: "ring-2 ring-warning/30",
    },
    2: {
      icon: <Medal className="h-5 w-5 text-muted-foreground" />,
      cardColor: "border-border bg-card",
      badgeColor: "bg-muted text-muted-foreground border-border",
      avatarRing: "",
    },
    3: {
      icon: <Medal className="h-5 w-5 text-primary" />,
      cardColor: "border-primary/20 bg-card",
      badgeColor: "bg-muted text-muted-foreground border-border",
      avatarRing: "",
    },
  }[position as 1 | 2 | 3];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("flex flex-col items-center", isFirst && "md:scale-105 md:z-10")}
    >
      <div
        className={cn(
          "w-full flex flex-col items-center gap-3 rounded-xl border p-5 transition-all",
          config.cardColor,
          isFirst && "shadow-lg shadow-warning/10"
        )}
      >
        {/* Trophy icon */}
        <div>{config.icon}</div>

        {/* Avatar */}
        <Avatar className={cn("h-14 w-14 border-2 border-card bg-muted", config.avatarRing)}>
          <AvatarFallback className="text-lg font-bold">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="text-center">
          <h3 className="text-sm font-bold tracking-tight truncate max-w-[140px]">{user.name}</h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
            Level {user.level}
          </p>
        </div>

        {/* Score */}
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-black tabular-nums">{user.totalScore}</span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase">Pts</span>
        </div>

        {/* Rank badge */}
        <span className={cn("px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border", config.badgeColor)}>
          Rank #{position}
        </span>
      </div>
    </motion.div>
  );
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-2 pb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className={cn("bg-muted/40 rounded-xl border border-border h-48", i === 2 && "md:h-56")} />
        ))}
      </div>
      <Skeleton className="h-10 w-full rounded-xl" />
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="border-b border-border bg-muted/20 h-12" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="border-b border-border/50 h-16 flex items-center px-6">
            <div className="w-8 h-4 bg-muted/40 rounded mr-8" />
            <div className="w-8 h-8 rounded-full bg-muted/40 mr-3" />
            <div className="w-32 h-4 bg-muted/40 rounded mr-auto" />
            <div className="w-12 h-4 bg-muted/40 rounded mr-16" />
            <div className="w-16 h-4 bg-muted/40 rounded mr-16" />
            <div className="w-12 h-4 bg-muted/40 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
