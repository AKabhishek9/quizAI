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
        className="max-w-2xl mx-auto text-center py-16"
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

        <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4">
          <div className={cn(
            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider mb-4 bg-primary/10 text-primary border border-primary/20",
          )}>
            <Flame className="h-2.5 w-2.5" />
            Daily Quest
          </div>
          
          <h1 className="text-lg font-semibold tracking-tight mb-1.5">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground mb-5 max-w-xs mx-auto">
            {description}
          </p>
          
          <div className="flex justify-center gap-4 text-xs text-neutral-500 dark:text-neutral-400 mb-6 divide-x divide-neutral-200 dark:divide-neutral-700">
            <div className="text-center pr-4">
              <p className="text-neutral-900 dark:text-neutral-100 font-medium tabular-nums">{questionCount}</p>
              <p>Questions</p>
            </div>
            <div className="text-center px-4">
              <p className="text-neutral-900 dark:text-neutral-100 font-medium tabular-nums">{timePerQuestion}s</p>
              <p>Timer</p>
            </div>
            <div className="text-center pl-4">
              <p className="text-neutral-900 dark:text-neutral-100 font-medium tabular-nums">+{xpReward}</p>
              <p>XP Reward</p>
            </div>
          </div>

          <Button
            onClick={onStart}
            className="w-full cursor-pointer h-9 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 border-0"
          >
            Start Challenge
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
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
      className="max-w-2xl mx-auto text-center py-16"
    >
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-4">
        <DifficultyBadge difficulty={difficulty || "medium"} className="mb-3" />
        <h1 className="text-lg font-semibold tracking-tight mb-1">
          {title}
        </h1>
        <p className="text-sm text-neutral-500 mt-2 mb-5">
          {description}
        </p>
        <div className="flex justify-center gap-4 text-xs text-neutral-500 mb-5 divide-x divide-neutral-200 dark:divide-neutral-700">
          <span className="pr-4">{questionCount} questions</span>
          <span className="pl-4">{timePerQuestion}s per question</span>
        </div>
        <Button
          onClick={onStart}
          className="cursor-pointer h-9 px-4 py-2 text-sm font-medium w-full rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 border-0"
        >
          Start quiz
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      </div>
    </motion.div>
  );
}
