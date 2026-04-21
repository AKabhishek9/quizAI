"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { QuizCard } from "@/components/quiz/quiz-card";
import { SkeletonCard } from "@/components/shared/skeleton-loader";
import { EmptyState } from "@/components/shared/empty-state";
import { getQuizzes } from "@/lib/api-client";
import type { Quiz } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function QuizCatalogPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    async function fetchLibrary() {
      try {
        const data = await getQuizzes();
        setQuizzes(data);
      } catch (err) {
        console.error("Failed to load quiz library:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLibrary();
  }, []);

  // Derive unique categories from quizzes
  const categories = useMemo(() => {
    const cats = Array.from(new Set(quizzes.map((q) => q.category)));
    return ["all", ...cats];
  }, [quizzes]);

  const filtered = quizzes.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      category === "all" || q.category.toLowerCase() === category.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Quick stats
  const totalQuizzes = quizzes.length;
  const avgScore = quizzes.length > 0 ? 72 : 0; // placeholder — real data would come from attempts

  return (
    <div className="space-y-5">
      {/* ── Header Row: Title + Stats ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* Left: Title + CTA */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">My Quizzes</h1>
          <button
            onClick={() => router.push("/quiz/stream")}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Create New Quiz
          </button>
        </div>

        {/* Right: Stats cards */}
        <div className="flex gap-3">
          <div className="border border-border rounded-lg bg-card px-5 py-3 min-w-[140px]">
            <p className="text-[11px] text-muted-foreground">Quizzes in Progress:</p>
            <p className="text-2xl font-bold text-foreground tabular-nums mt-0.5">{totalQuizzes}</p>
          </div>
          <div className="border border-border rounded-lg bg-card px-5 py-3 min-w-[140px]">
            <p className="text-[11px] text-muted-foreground">Average Score:</p>
            <p className="text-2xl font-bold text-foreground tabular-nums mt-0.5">{avgScore}%</p>
          </div>
        </div>
      </div>

      {/* ── Search + Category Filters ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search quizzes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 text-sm bg-card border-border"
            aria-label="Search quizzes"
          />
        </div>

        {/* Category pills */}
        <div className="flex gap-1.5 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border",
                category === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-foreground/30"
              )}
            >
              {cat === "all" ? "All" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Quiz Grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
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
            setCategory("all");
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map((quiz, index) => (
            <QuizCard key={quiz.id} quiz={quiz} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
