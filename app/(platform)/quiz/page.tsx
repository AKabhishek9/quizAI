"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { QuizCard } from "@/components/quiz/quiz-card";
import { SkeletonCard } from "@/components/shared/skeleton-loader";
import { EmptyState } from "@/components/shared/empty-state";
import { getQuizzes } from "@/lib/api-client";
import type { Quiz, Difficulty } from "@/lib/types";
import { cn } from "@/lib/utils";

const difficultyFilters: { value: Difficulty | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

export default function QuizCatalogPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [dailyQuizzes, setDailyQuizzes] = useState<Record<string, any>>({});
  const [loadingLibrary, setLoadingLibrary] = useState(true);
  const [loadingDaily, setLoadingDaily] = useState(true);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    // 1. Fetch Daily Quests (priority - should be fast)
    async function fetchDaily() {
      try {
        const m = await import("@/lib/api-client");
        const dailyData = await m.getDailyQuizzes();
        setDailyQuizzes(dailyData);
      } catch (err) {
        console.error("Failed to load daily quizzes:", err);
      } finally {
        setLoadingDaily(false);
      }
    }

    // 2. Fetch Library Quizzes (secondary - might be slower/cached)
    async function fetchLibrary() {
      try {
        const data = await getQuizzes();
        setQuizzes(data);
      } catch (err) {
        console.error("Failed to load quiz library:", err);
      } finally {
        setLoadingLibrary(false);
      }
    }

    fetchDaily();
    fetchLibrary();
  }, []);

  // Countdown timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setHours(24, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();
      
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${h}h ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const filtered = quizzes.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.category.toLowerCase().includes(search.toLowerCase());
    const matchesDifficulty =
      difficulty === "all" || q.difficulty === difficulty;
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="space-y-8">
      {/* Daily Quests Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Daily Quests
            </h2>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-secondary text-secondary-foreground font-mono">
              Refreshes in {timeLeft}
            </span>
          </div>
        </div>

        {loadingDaily ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
             {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 rounded-xl border border-dashed border-border flex items-center justify-center">
                <div className="h-4 w-24 bg-secondary/50 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : Object.keys(dailyQuizzes).length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center bg-secondary/10">
            <p className="text-xs text-muted-foreground">Daily quizzes are being generated. Check back in a moment!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(dailyQuizzes).map(([key, quiz], index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="group relative rounded-xl border border-border bg-card p-4 hover:border-primary/50 transition-all cursor-pointer overflow-hidden"
                onClick={() => router.push(`/quiz/daily/${key}`)}
              >
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                   <Zap className="h-12 w-12 text-primary" />
                </div>
                
                <div className="flex flex-col h-full space-y-2">
                  <span className="text-[10px] font-bold text-primary uppercase">{key.replace("_", " ")}</span>
                  <h3 className="text-sm font-semibold leading-tight">{quiz.title}</h3>
                  <p className="text-[11px] text-muted-foreground flex-1 line-clamp-2">
                    {quiz.description}
                  </p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[10px] font-medium text-muted-foreground">10 Questions</span>
                    <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Zap className="h-3.5 w-3.5 fill-current" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <div className="h-px bg-border/50" />

      {/* Main Catalog Header */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3"
      >
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Quiz Library</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Explore our vast collection of adaptive learning paths
          </p>
        </div>
        <Button
          onClick={() => router.push("/quiz/stream")}
          size="sm"
          className="cursor-pointer h-8 text-xs font-medium glow"
        >
          <Zap className="mr-1 h-3 w-3" />
          Generate Mixed Quiz
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.08 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search quizzes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs"
            aria-label="Search quizzes"
          />
        </div>

        <div className="flex gap-1.5">
          {difficultyFilters.map((filter) => (
            <Button
              key={filter.value}
              variant="outline"
              size="sm"
              onClick={() => setDifficulty(filter.value)}
              className={cn(
                "cursor-pointer h-8 text-xs",
                difficulty === filter.value &&
                  "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
              )}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Grid */}
      {loadingLibrary ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No quizzes found"
          description="Try adjusting your search or filters."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch("");
            setDifficulty("all");
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((quiz, index) => (
            <QuizCard key={quiz.id} quiz={quiz} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
