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
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center max-w-md">
          <h2 className="text-base font-semibold mb-2 font-heading">Could not load profile</h2>
          <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
          <p className="text-xs text-muted-foreground">Make sure the backend server is running on port 5000.</p>
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
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* ── Profile Header Card ── */}
      <div className="rounded-lg border border-border bg-card p-6">
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
            <div className="shrink-0 w-full md:w-56 border border-border rounded-lg p-4 bg-card">
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
        <div className="space-y-3">
          <h2 className="text-base font-bold text-foreground font-heading">Your Performance</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
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

      {/* ── Tabs — using variant="line" for underline style ── */}
      <Tabs defaultValue="history" className="space-y-4">
        <TabsList variant="line" className="border-b border-border w-full justify-start h-auto p-0">
          <TabsTrigger value="history" className="cursor-pointer px-4 py-2.5 text-sm">
            Quiz History
          </TabsTrigger>
          <TabsTrigger value="analytics" className="cursor-pointer px-4 py-2.5 text-sm">
            Detailed Analytics
          </TabsTrigger>
          <TabsTrigger value="achievements" className="cursor-pointer px-4 py-2.5 text-sm">
            Achievements
          </TabsTrigger>
        </TabsList>

        {/* Quiz History Table */}
        <TabsContent value="history" className="mt-2">
          <div className="rounded-lg border border-border bg-card overflow-x-auto">
            {/* Table */}
            <table className="w-full text-left">
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
        <TabsContent value="analytics" className="space-y-4 mt-2">
          {stats && (
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="text-sm font-semibold mb-3">Performance Trend</h3>
              <PerformanceChart data={stats.weeklyScores} />
            </div>
          )}
          {stats && (
            <div className="rounded-lg border border-border bg-card p-5">
              <h3 className="text-sm font-semibold mb-3">Category Performance</h3>
              <div className="space-y-3">
                {stats.categoryPerformance.map((cat) => (
                  <ProgressBar
                    key={cat.category}
                    label={cat.category}
                    value={cat.percentage}
                    color={
                      cat.percentage >= 80
                        ? "success"
                        : cat.percentage >= 60
                        ? "primary"
                        : cat.percentage >= 40
                        ? "warning"
                        : "destructive"
                    }
                    size="sm"
                  />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Achievements */}
        <TabsContent value="achievements" className="mt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { id: "first_quiz", name: "First Steps", icon: "🎯", desc: "Complete your first quiz" },
              { id: "streak_7", name: "Week Warrior", icon: "🔥", desc: "7-day streak" },
              { id: "perfect_score", name: "Flawless", icon: "✨", desc: "Get a 100% score" },
              { id: "level_10", name: "Mastery", icon: "👑", desc: "Reach Level 10" },
            ].map((ach) => (
              <div key={ach.id} className="rounded-lg border border-border bg-card p-5 flex flex-col items-center justify-center text-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  {ach.id === "first_quiz" && <Target className="h-5 w-5 text-muted-foreground" />}
                  {ach.id === "streak_7" && <Flame className="h-5 w-5 text-muted-foreground" />}
                  {ach.id === "perfect_score" && <Trophy className="h-5 w-5 text-muted-foreground" />}
                  {ach.id === "level_10" && <BookOpen className="h-5 w-5 text-muted-foreground" />}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">{ach.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{ach.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
