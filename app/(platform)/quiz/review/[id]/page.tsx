"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, CheckCircle2, XCircle, AlertCircle, Loader2, Award, BookOpen, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getQuizAttemptById } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { DifficultyBadge } from "@/components/quiz/difficulty-badge";

interface ReviewPageProps {
  params: Promise<{ id: string }>;
}

interface ReviewAnswer {
  isCorrect: boolean;
  selectedOption: number;
  question?: {
    question?: string;
    options?: string[];
    answer?: number;
    concept?: string;
  };
}

interface ReviewAttempt {
  createdAt: string;
  score: number;
  totalQuestions: number;
  topics: string[];
  difficulty: string;
  answers: ReviewAnswer[];
}

export default function ReviewPage({ params }: ReviewPageProps) {
  const router = useRouter();
  const { id } = use(params);
  
  const [attempt, setAttempt] = useState<ReviewAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAttempt() {
      try {
        setLoading(true);
        const data = await getQuizAttemptById(id);
        if (!data) {
          setAttempt(null);
        } else {
          const rec = data as Record<string, unknown>;
          const normalized: ReviewAttempt = {
            createdAt: String(rec.createdAt ?? ""),
            score: Number(rec.score ?? 0),
            totalQuestions: Number(rec.totalQuestions ?? 0),
            topics: Array.isArray(rec.topics) ? (rec.topics as string[]) : [],
            difficulty: String(rec.difficulty ?? ""),
            answers: Array.isArray(rec.answers)
              ? (rec.answers as unknown[]).map((a) => {
                  const ar = a as Record<string, unknown>;
                  return {
                    isCorrect: Boolean(ar.isCorrect),
                    selectedOption: Number(ar.selectedOption ?? 0),
                    question: ar.question ? {
                      question: String((ar.question as Record<string, unknown>).question ?? ""),
                      options: Array.isArray((ar.question as Record<string, unknown>).options) ? ((ar.question as Record<string, unknown>).options as string[]) : [],
                      answer: Number((ar.question as Record<string, unknown>).answer ?? 0),
                      concept: String((ar.question as Record<string, unknown>).concept ?? ""),
                    } : undefined,
                  } as ReviewAnswer;
                })
              : [],
          };

          setAttempt(normalized);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load attempt details");
      } finally {
        setLoading(false);
      }
    }
    loadAttempt();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm font-medium text-muted-foreground">Retrieving historical data...</p>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-3" />
          <h2 className="text-base font-semibold mb-1">Failed to load review</h2>
          <p className="text-sm text-muted-foreground mb-6">{error || "Review record not found"}</p>
          <Button onClick={() => router.push("/dashboard")} size="sm">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-20 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.back()}
          className="hover:bg-accent/50 -ml-2"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
            Assessment Record
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date(attempt.createdAt).toLocaleDateString(undefined, { 
              year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
            })}
          </p>
        </div>
      </div>

      {/* Hero Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card/50 backdrop-blur-md p-8 elevated mb-10 overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-success/5 rounded-full -ml-12 -mb-12 blur-2xl" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          <div className="flex flex-col items-center md:items-start">
             <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                <Target className="h-4 w-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Final Score</span>
             </div>
             <div className="text-5xl font-black tracking-tighter">
                {attempt.score}%
             </div>
             <p className="text-xs text-muted-foreground mt-2">
                {Math.round((attempt.score / 100) * attempt.totalQuestions)} of {attempt.totalQuestions} questions correct
             </p>
          </div>

          <div className="flex flex-col items-center md:items-start border-y md:border-y-0 md:border-x border-border/50 py-6 md:py-0 md:px-8">
             <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                <Award className="h-4 w-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Difficulty Level</span>
             </div>
             <div className="mt-1">
                <DifficultyBadge difficulty={attempt.difficulty} />
             </div>
             <p className="text-xs text-muted-foreground mt-3">
                Adaptive level during session
             </p>
          </div>

          <div className="flex flex-col items-center md:items-start">
             <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                <BookOpen className="h-4 w-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Topic Mix</span>
             </div>
             <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 mt-1">
                {attempt.topics.map((t: string) => (
                    <span 
                      key={t}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium border border-border"
                    >
                        {t}
                    </span>
                ))}
             </div>
          </div>
        </div>
      </motion.div>

      {/* Question List */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold tracking-tight px-1">Detailed Breakdown</h3>
        {attempt.answers.map((answer: ReviewAnswer, idx: number) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={cn(
                "rounded-xl border bg-card p-6 elevated-sm transition-all relative overflow-hidden",
                answer.isCorrect ? "border-success/20" : "border-destructive/20"
            )}
          >
            {/* Status indicator line */}
            <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1",
                answer.isCorrect ? "bg-success" : "bg-destructive"
            )} />

            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-muted-foreground w-6 h-6 rounded-full border border-border flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                    {answer.question?.concept || "Analytical Concept"}
                </span>
              </div>
              {answer.isCorrect ? (
                <div className="flex items-center gap-1.5 text-success font-bold text-[10px] uppercase tracking-wider bg-success/10 px-2 py-1 rounded-md">
                   <CheckCircle2 className="h-3 w-3" />
                   Correct
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-destructive font-bold text-[10px] uppercase tracking-wider bg-destructive/10 px-2 py-1 rounded-md">
                   <XCircle className="h-3 w-3" />
                   Incorrect
                </div>
              )}
            </div>

            <h4 className="text-[15px] font-medium leading-relaxed mb-6">
              {answer.question?.question || "Question content unavailable"}
            </h4>

            <div className="space-y-2.5">
              {(answer.question?.options ?? []).map((opt: string, optIdx: number) => {
                const isSelected = answer.selectedOption === optIdx;
                const isCorrectAnswer = (answer.question?.answer ?? -1) === optIdx;
                
                return (
                  <div 
                    key={optIdx}
                    className={cn(
                        "text-sm p-3.5 rounded-lg border transition-all flex items-center justify-between",
                        isCorrectAnswer 
                            ? "bg-success/20 border-success/60 text-success-foreground font-semibold dark:bg-success/15" 
                            : isSelected && !answer.isCorrect
                                ? "bg-destructive/10 border-destructive/40 text-destructive-foreground"
                                : "bg-background border-border text-muted-foreground hover:border-foreground/20"
                    )}
                  >
                    <div className="flex items-center gap-3">
                        <span className={cn(
                            "w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shadow-sm",
                            isCorrectAnswer ? "bg-gradient-to-br from-success to-success/80 text-white" : 
                            isSelected ? "bg-gradient-to-br from-destructive to-destructive/80 text-white" : "bg-secondary text-secondary-foreground"
                        )}>
                            {String.fromCharCode(65 + optIdx)}
                        </span>
                        {opt}
                    </div>
                    {isCorrectAnswer && (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                    )}
                    {isSelected && !answer.isCorrect && (
                        <span className="text-[10px] uppercase font-bold text-destructive">Your Choice</span>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button variant="outline" onClick={() => router.push("/quiz/topic")}>
          Take Another Assessment
        </Button>
        <Button onClick={() => router.push("/dashboard")}>
          Finish Review
        </Button>
      </div>
    </div>
  );
}
