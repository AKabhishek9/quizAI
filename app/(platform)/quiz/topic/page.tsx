"use client";

import { useMemo, useState, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, ArrowRight, Zap, Lightbulb, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getQuizzes } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const SUGGESTIONS: Record<string, string[]> = {
  General: ["Current Affairs", "Aptitude", "Reasoning", "General Knowledge", "World Geography"],
  "Tech & Software": ["React", "Node.js", "Docker", "Algorithms", "System Design", "AWS", "Python", "TypeScript", "Graph Theory", "Kubernetes"],
  "Pure Sciences": ["Quantum Mechanics", "Organic Chemistry", "Genetics", "Thermodynamics", "Cellular Biology"],
  "Commerce & Finance": ["Microeconomics", "Financial Accounting", "Corporate Finance", "Macroeconomics"],
  "Humanities & General": ["World War 2", "Renaissance Art", "Political Philosophy", "Ancient Rome"],
};

type DifficultyLabel = "easy" | "medium" | "hard";

const DIFFICULTY_OPTIONS: { label: DifficultyLabel; display: string; description: string }[] = [
  { label: "easy", display: "Easy", description: "Core concepts & definitions" },
  { label: "medium", display: "Medium", description: "Applied & practical problems" },
  { label: "hard", display: "Hard", description: "Advanced & problem-solving" },
];

function TopicSelectionEngine() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stream = searchParams.get("stream") || "Tech & Software";

  const [topics, setTopics] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyLabel>("medium");

  const { data: availableQuizzes } = useQuery({
    queryKey: ["available-quizzes"],
    queryFn: getQuizzes,
  });

  const suggestions = useMemo(() => {
    const streamTokens = stream
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length > 2);

    const dynamic = (availableQuizzes ?? [])
      .filter((quiz) => {
        const haystack = `${quiz.title} ${quiz.description} ${quiz.category}`.toLowerCase();
        return streamTokens.some((token) => haystack.includes(token));
      })
      .flatMap((quiz) => [
        quiz.title,
        quiz.category,
        ...(quiz.questions ?? []).map((question) => question.topic),
      ])
      .filter((topic): topic is string => Boolean(topic?.trim()));

    const unique = Array.from(new Set(dynamic)).slice(0, 10);
    return unique.length ? unique : SUGGESTIONS[stream] || SUGGESTIONS["Tech & Software"];
  }, [availableQuizzes, stream]);

  const availableSuggestions = suggestions.filter((suggestion) => !topics.includes(suggestion));

  const addTopic = (topic: string) => {
    const cleanTopic = topic.trim();
    if (cleanTopic && !topics.includes(cleanTopic) && topics.length < 5) {
      setTopics([...topics, cleanTopic]);
      setInputValue("");
    }
  };

  const removeTopic = (topic: string) => {
    setTopics(topics.filter((item) => item !== topic));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTopic(inputValue);
    }
  };

  const generateQuiz = () => {
    if (topics.length === 0) return;
    const topicsParam = encodeURIComponent(topics.join(","));
    router.push(
      `/quiz/play?stream=${encodeURIComponent(stream)}&topics=${topicsParam}&difficulty=${difficulty}`
    );
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 space-y-6">
      <div className="text-center space-y-3">
        <Badge variant="outline" className="bg-secondary text-secondary-foreground uppercase tracking-wider text-[10px]">
          {stream}
        </Badge>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-heading text-2xl font-bold tracking-tight"
        >
          Select Your Topics
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground text-sm max-w-lg mx-auto"
        >
          Choose up to 5 topics. If a topic is not in the library, the AI will generate questions for it.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="card-base p-4 sm:p-6 space-y-6"
      >
        <div className="space-y-3">
          <label className="font-heading text-sm font-medium text-foreground">
            Search or Type Custom Topic
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1 min-w-0">
              <Zap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
              <Input
                placeholder='e.g., "DynamoDB", "Cold War history", "Thermodynamics"'
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={topics.length >= 5}
                className="pl-9 h-11 bg-muted border-border"
              />
            </div>
            <Button
              onClick={() => addTopic(inputValue)}
              disabled={!inputValue.trim() || topics.length >= 5}
              className="h-11 px-6 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Lightbulb className="w-3 h-3" />
            Press enter to add multiple topics quickly. Max 5 topics.
          </p>
        </div>

        <div className="bg-muted border border-border rounded-xl p-4 sm:p-5 min-h-[120px]">
          {topics.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-2 text-muted-foreground pt-3">
              <p className="text-sm">Your topic list is empty.</p>
              <p className="text-xs">Select from suggestions below or type your own.</p>
            </div>
          ) : (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider shrink-0">
                Topics ({topics.length}/5):
              </span>
              <AnimatePresence>
                {topics.map((topic) => (
                  <motion.div
                    key={topic}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="border border-primary bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 max-w-full"
                  >
                    <span className="truncate">{topic}</span>
                    <button
                      type="button"
                      onClick={() => removeTopic(topic)}
                      aria-label={`Remove ${topic}`}
                      className="opacity-70 hover:opacity-100 transition-opacity rounded-full p-0.5 shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <label className="font-heading text-sm font-medium text-foreground">
            Difficulty Level
          </label>
          <div className="flex gap-2 flex-wrap">
            {DIFFICULTY_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => setDifficulty(opt.label)}
                className={cn(
                  "group relative px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-150",
                  difficulty === opt.label
                    ? opt.label === "easy"
                      ? "bg-success/10 border-success/40 text-success"
                      : opt.label === "medium"
                      ? "bg-warning/10 border-warning/40 text-warning"
                      : "bg-destructive/10 border-destructive/40 text-destructive"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                )}
                aria-pressed={difficulty === opt.label}
              >
                <span>{opt.display}</span>
                <span
                  className={cn(
                    "block text-[10px] font-normal mt-0.5 leading-tight",
                    difficulty === opt.label ? "opacity-80" : "opacity-50"
                  )}
                >
                  {opt.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="font-heading text-sm font-medium text-foreground">
            Suggested for {stream}
          </label>
          <div className="flex flex-wrap gap-2">
            {availableSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => addTopic(suggestion)}
                disabled={topics.length >= 5}
                className="border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                + {suggestion}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-border flex flex-col-reverse sm:flex-row gap-3 sm:justify-between sm:items-center">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Back to Streams
          </Button>
          <Button
            onClick={generateQuiz}
            disabled={topics.length === 0}
            className="h-10 px-8 font-medium"
          >
            Generate Quiz
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default function TopicSelectionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-[50vh]">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      }
    >
      <TopicSelectionEngine />
    </Suspense>
  );
}
