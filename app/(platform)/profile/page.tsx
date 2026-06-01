"use client";

import { useState } from "react";
import { updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, Trophy, BookOpen, Flame, Target, Pencil } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCard } from "@/components/dashboard/stats-card";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { DifficultyBadge } from "@/components/quiz/difficulty-badge";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { SkeletonStatsGrid, SkeletonCard } from "@/components/shared/skeleton-loader";
import { getUserDashboard } from "@/lib/api-client";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getUserDashboard,
    enabled: !authLoading && !!user,
  });

  const profile = data?.profile;
  const stats = data?.stats;
  const history = data?.history;

  if (!authLoading && !user) {
    router.push("/login");
    return null;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <div role="alert" className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center max-w-md">
          <h2 className="text-base font-semibold mb-2 font-heading">Could not load profile</h2>
          <p className="text-sm text-muted-foreground mb-4">
            We couldn&apos;t load your profile right now. Please check your connection and try again.
          </p>
          <Button size="sm" onClick={() => window.location.reload()} className="cursor-pointer">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonStatsGrid />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 min-w-0">
      {/* ── Profile Header Card ── */}
      <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm min-w-0">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Avatar with level badge */}
          <div className="relative shrink-0 self-center md:self-start">
            <Avatar className="h-20 w-20 border-2 border-border bg-muted">
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xl">
                {profile?.name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap">
              Level {profile?.level}
            </div>
          </div>

          {/* Name + Edit + Joined */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2 font-heading">
              {profile?.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
              <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogTrigger render={
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditName(profile?.name || "")}
                    className="h-7 gap-1.5 text-xs cursor-pointer"
                  />
                }>
                  <Pencil className="h-3 w-3" />
                  Edit Profile
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Display Name</Label>
                      <Input
                        id="name"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Your name"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                    <Button 
                      disabled={isSaving || !editName.trim()} 
                      onClick={async () => {
                        if (!auth?.currentUser || !editName.trim()) return;
                        setIsSaving(true);
                        try {
                          await updateProfile(auth.currentUser, { displayName: editName.trim() });
                          toast.success("Profile updated successfully");
                          setIsEditOpen(false);
                          window.location.reload();
                        } catch (err) {
                          toast.error("Failed to update profile");
                        } finally {
                          setIsSaving(false);
                        }
                      }}
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              {profile?.memberSince && (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Joined {profile.memberSince}
                </span>
              )}
            </div>
          </div>

          {/* Mastery XP — right side */}
          {profile && (
            <div className="shrink-0 w-full md:w-64 border border-border rounded-2xl p-5 bg-muted/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-foreground">Mastery XP</span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {profile.xp} / {profile.xpToNextLevel} XP
                </span>
              </div>
              <ProgressBar
                value={(profile.xp / profile.xpToNextLevel) * 100}
                size="sm"
                className="bg-muted h-2"
                showPercentage={false}
              />
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[10px] text-muted-foreground">Level {profile.level}</span>
                <span className="text-[10px] text-muted-foreground">Level {profile.level + 1}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Detailed Stats Grid ── */}
      {stats && (
        <div className="space-y-4 min-w-0">
          <h2 className="text-lg font-bold text-foreground font-heading">Your Performance</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
            <StatsCard title="Quizzes" value={stats.totalQuizzes} icon={BookOpen} />
            <StatsCard title="Avg. Score" value={`${stats.averageScore}%`} icon={Target} />
            <StatsCard
              title="Current Streak"
              value={`${stats.currentStreak}d`}
              icon={Flame}
              className={cn(stats.currentStreak > 0 && "border-warning/30")}
            />
            <StatsCard title="Best Streak" value={`${stats.bestStreak}d`} icon={Trophy} />
            <StatsCard title="Global Rank" value={`#${stats.rank}`} icon={Trophy} />
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      <Tabs defaultValue="history" className="w-full min-w-0">
        <div>
          <TabsList className="flex flex-row flex-wrap gap-2 bg-muted/20 p-1 rounded-xl h-auto w-full justify-start">
            <TabsTrigger value="history">Quiz History</TabsTrigger>
            <TabsTrigger value="analytics">Detailed Analytics</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>
        </div>

        {/* Quiz History Table */}
        <TabsContent value="history">
          <div className="rounded-2xl border border-border bg-card overflow-x-auto shadow-sm">
            {/* Table */}
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Quiz</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Score</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Difficulty</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Topics</th>
                  <th className="px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {history?.map((attempt, index) => (
                  <motion.tr
                    key={attempt.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-6 py-3.5">
                      <span className="text-sm font-medium text-foreground">{attempt.quizTitle}</span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-sm text-foreground tabular-nums">{attempt.score}%</span>
                    </td>
                    <td className="px-6 py-3.5">
                      <DifficultyBadge difficulty={attempt.difficulty} />
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-sm text-muted-foreground truncate max-w-[200px] inline-block">
                        {(attempt as any).topics?.join(", ") || attempt.category || "General"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-sm text-muted-foreground">{attempt.date}</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {(!history || history.length === 0) && (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-muted-foreground">No quiz history yet. Start a quiz!</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Detailed Analytics */}
        <TabsContent value="analytics">
          {stats ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col min-w-0 lg:col-span-2">
                <h3 className="text-base font-semibold mb-6 text-foreground font-heading">Performance Trend</h3>
                <div className="relative w-full" style={{ height: 300 }}>
                  {stats.weeklyScores && stats.weeklyScores.length > 0 ? (
                    <PerformanceChart data={stats.weeklyScores} />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm border-2 border-dashed border-border rounded-xl">
                      No performance data available yet
                    </div>
                  )}
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col min-w-0 lg:col-span-1">
                <h3 className="text-base font-semibold mb-6 text-foreground font-heading">Category Performance</h3>
                <div className="space-y-5 min-h-[300px] max-h-[300px] overflow-y-auto pr-2">
                  {stats.categoryPerformance && stats.categoryPerformance.length > 0 ? (
                    stats.categoryPerformance.map((cat) => (
                      <ProgressBar
                        key={cat.category}
                        label={cat.category}
                        value={cat.percentage}
                        color={
                          cat.percentage >= 80 ? "success" :
                          cat.percentage >= 60 ? "primary" :
                          cat.percentage >= 40 ? "warning" : "destructive"
                        }
                        size="sm"
                      />
                    ))
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm border-2 border-dashed border-border rounded-xl">
                      No category data available yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <SkeletonCard className="h-[300px] lg:col-span-2" />
              <SkeletonCard className="h-[300px] lg:col-span-1" />
            </div>
          )}
        </TabsContent>

        {/* Achievements */}
        <TabsContent value="achievements">
          <div className="w-full overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(() => {
                const totalQuizzes = stats?.totalQuizzes ?? 0;
                const bestStreak = Math.max(stats?.bestStreak ?? 0, stats?.currentStreak ?? 0);
                const hasPerfect = (history ?? []).some((h) => h.score >= 100);
                const level = profile?.level ?? 1;
                const achievements = [
                  { id: "first_quiz", name: "First Steps", desc: "Complete your first quiz", current: Math.min(totalQuizzes, 1), goal: 1, Icon: Target },
                  { id: "streak_7", name: "Week Warrior", desc: "Reach a 7-day streak", current: Math.min(bestStreak, 7), goal: 7, Icon: Flame },
                  { id: "perfect_score", name: "Flawless", desc: "Score 100% on a quiz", current: hasPerfect ? 1 : 0, goal: 1, Icon: Trophy },
                  { id: "level_10", name: "Mastery", desc: "Reach Level 10", current: Math.min(level, 10), goal: 10, Icon: BookOpen },
                ];
                return achievements.map((ach) => {
                  const pct = Math.min(100, Math.round((ach.current / ach.goal) * 100));
                  const unlocked = ach.current >= ach.goal;
                  return (
                    <div
                      key={ach.id}
                      className={cn(
                        "rounded-2xl border bg-card p-5 flex flex-col items-center text-center gap-3 transition-colors shadow-sm min-w-0",
                        unlocked ? "border-success/40 bg-success/5" : "border-border"
                      )}
                    >
                      <div
                        className={cn(
                          "h-11 w-11 shrink-0 rounded-full flex items-center justify-center",
                          unlocked ? "bg-success/15" : "bg-muted"
                        )}
                      >
                        <ach.Icon className={cn("h-5 w-5", unlocked ? "text-success" : "text-muted-foreground")} />
                      </div>
                      <div className="min-w-0 w-full">
                        <h4 className="text-sm font-semibold text-foreground truncate">{ach.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{ach.desc}</p>
                      </div>
                      <div className="w-full mt-1">
                        <ProgressBar
                          value={pct}
                          color={unlocked ? "success" : "primary"}
                          size="sm"
                          showPercentage={false}
                        />
                        <p className="text-[10px] text-muted-foreground mt-1.5 tabular-nums">
                          {unlocked ? "Unlocked" : `${ach.current}/${ach.goal}`}
                        </p>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
