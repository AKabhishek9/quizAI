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
import { getQuizzes } from "@/lib/api";
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
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");

  useEffect(() => {
    async function load() {
      const data = await getQuizzes();
      setQuizzes(data);
      setLoading(false);
    }
    load();
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
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3"
      >
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Quizzes</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Choose a topic or let our adaptive engine pick for you
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
      {loading ? (
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
