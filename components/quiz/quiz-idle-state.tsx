import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Trophy, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DifficultyBadge } from "@/components/quiz/difficulty-badge";
import { cn } from "@/lib/utils";

interface QuizIdleStateProps {
  isDaily?: boolean;
  title: string;
  description: string;
  questionCount: number;
  timePerQuestion: number;
  difficulty?: string | number;
  themeClass?: string;
  themeName?: string;
  xpReward?: number;
  onStart: () => void;
  onBack?: () => void;
}

export function QuizIdleState({
  isDaily,
  title,
  description,
  questionCount,
  timePerQuestion,
  difficulty,
  themeClass,
  themeName,
  xpReward = 50,
  onStart,
  onBack,
}: QuizIdleStateProps) {
  if (isDaily) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto text-center py-16"
      >
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mb-8 text-muted-foreground hover:text-foreground -ml-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        )}

        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Trophy className="h-24 w-24" />
          </div>
          
          <div className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 border bg-opacity-10",
            themeClass
          )}>
            <Flame className="h-3 w-3 fill-current" />
            Daily Quest
          </div>
          
          <h1 className="text-2xl font-semibold tracking-tight mb-2">
            {title} Challenge
          </h1>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
            {description}
          </p>
          
          <div className="flex justify-center gap-8 text-xs text-muted-foreground mb-8">
            <div className="text-center">
              <p className="text-foreground font-semibold">{questionCount}</p>
              <p>Questions</p>
            </div>
            <div className="text-center">
              <p className="text-foreground font-semibold">{timePerQuestion}s</p>
              <p>Timer</p>
            </div>
            <div className="text-center">
              <p className="text-foreground font-semibold">+{xpReward}</p>
              <p>XP Reward</p>
            </div>
          </div>

          <Button
            onClick={onStart}
            className={cn(
              "w-full cursor-pointer h-12 text-sm font-semibold shadow-lg transition-transform active:scale-95",
              themeName === "indigo" && "bg-indigo-600 hover:bg-indigo-500 text-white",
              themeName === "emerald" && "bg-emerald-600 hover:bg-emerald-500 text-white",
              themeName === "amber" && "bg-amber-600 hover:bg-amber-500 text-white",
              themeName === "rose" && "bg-rose-600 hover:bg-rose-500 text-white"
            )}
          >
            Start Challenge
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    );
  }

  // Standard Quiz
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto text-center py-16"
    >
      <div className="rounded-xl border border-border bg-card p-8">
        <DifficultyBadge difficulty={difficulty || "medium"} className="mb-3" />
        <h1 className="text-lg font-semibold tracking-tight mb-1">
          {title}
        </h1>
        <p className="text-xs text-muted-foreground mb-5">
          {description}
        </p>
        <div className="flex justify-center gap-5 text-[11px] text-muted-foreground mb-6">
          <span>{questionCount} questions</span>
          <span>{timePerQuestion}s per question</span>
        </div>
        <Button
          onClick={onStart}
          className="cursor-pointer h-9 px-6 text-sm font-medium"
        >
          Start quiz
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      </div>
    </motion.div>
  );
}
