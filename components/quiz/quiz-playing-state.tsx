"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuizOption } from "@/components/quiz/quiz-option";
import { QuizTimer } from "@/components/quiz/quiz-timer";
import { DifficultyBadge } from "@/components/quiz/difficulty-badge";
import { ProgressBar } from "@/components/dashboard/progress-bar";
import { cn } from "@/lib/utils";
import type { Question } from "@/lib/types";

interface QuizPlayingStateProps {
  isDaily?: boolean;
  category?: string;
  themeClass?: string;
  themeName?: string;
  difficulty?: string | number;
  currentQuestionIndex: number;
  questionCount: number;
  timeRemaining: number;
  totalTime: number;
  currentQuestion: Question | null;
  selectedAnswer: string | null;
  showFeedback: boolean;
  isCorrect: boolean | null;
  submitAnswer: () => void;
  selectAnswer: (id: string) => void;
  nextQuestion: () => void;
  isSubmitting?: boolean;
  isTimerExpired?: boolean;
}

export function QuizPlayingState({
  isDaily,
  category,
  themeClass,
  themeName,
  difficulty,
  currentQuestionIndex,
  questionCount,
  timeRemaining,
  totalTime,
  currentQuestion,
  selectedAnswer,
  showFeedback,
  isCorrect,
  submitAnswer,
  selectAnswer,
  nextQuestion,
  isSubmitting,
  isTimerExpired = false,
}: QuizPlayingStateProps) {
  return (
    <div className={cn("max-w-2xl mx-auto space-y-4 flex flex-col items-center w-full", isDaily && "py-4")}>
      {/* Top bar */}
      <div className={cn("w-full space-y-2", isDaily && "space-y-3")}>
        <div className="flex items-center justify-between w-full">
          {isDaily ? (
            <div className="flex flex-col">
              <span className={cn(
                "text-[10px] uppercase tracking-wider font-bold mb-0.5",
                themeClass
              )}>
                Daily Quest: {category}
              </span>
              <span className="text-xs font-medium tabular-nums">
                Question {currentQuestionIndex + 1}{" "}
                <span className="text-muted-foreground font-normal">of {questionCount}</span>
              </span>
            </div>
          ) : (
            <span className="text-xs font-medium tabular-nums">
              {currentQuestionIndex + 1}{" "}
              <span className="text-muted-foreground">/ {questionCount}</span>
            </span>
          )}

          {isDaily ? (
            <div className="flex items-center gap-3">
              <QuizTimer timeRemaining={timeRemaining} totalTime={totalTime} className="scale-90" />
            </div>
          ) : (
            <>
              <DifficultyBadge difficulty={difficulty || "medium"} />
            </>
          )}
        </div>
        
        {!isDaily && <QuizTimer timeRemaining={timeRemaining} totalTime={totalTime} />}
        
        <ProgressBar
          value={((currentQuestionIndex + 1) / questionCount) * 100}
          showPercentage={false}
          size="sm"
          className={cn(isDaily && "h-1.5")}
          color={isDaily ? (themeName as any) : undefined}
        />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "rounded-lg border border-border bg-card w-full",
            isDaily ? "p-4 min-h-[300px] flex flex-col" : "p-4"
          )}
        >

          <h2 className={cn(
            "font-semibold leading-relaxed mb-4 text-foreground font-heading",
            isDaily ? "text-lg mb-6 relative z-10" : "text-lg"
          )}>
            {currentQuestion?.text}
          </h2>

          <div className={cn("space-y-3", isDaily && "mt-auto relative z-10")} role="radiogroup" aria-label="Answer options">
            {currentQuestion?.options.map((option) => (
              <QuizOption
                key={option.id}
                option={option}
                isSelected={selectedAnswer === option.id}
                isCorrect={
                  showFeedback && selectedAnswer === option.id
                    ? isCorrect
                    : null
                }
                isRevealed={showFeedback}
                correctOptionId={currentQuestion.correctOptionId}
                onSelect={selectAnswer}
                disabled={showFeedback || isTimerExpired}
              />
            ))}
          </div>

          <AnimatePresence>
            {showFeedback && currentQuestion && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className={cn(
                  "mt-3 p-3 rounded-lg border",
                  isDaily ? "mt-4 p-3 rounded-lg bg-primary/10 border-primary/20 relative z-10" : "bg-muted/50 border-border"
                )}
              >
                {isDaily ? (
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      isCorrect ? "bg-success" : "bg-destructive"
                    )} />
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Explanation
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] font-medium text-muted-foreground mb-0.5">
                    Explanation
                  </p>
                )}
                <p className={cn(
                  "text-muted-foreground leading-relaxed",
                  isDaily ? "text-[13px]" : "text-sm"
                )}>
                  {currentQuestion.explanation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {/* Actions */}
      <div className={cn("flex justify-end w-full", isDaily && "pt-1")}>
        {!showFeedback ? (
          <Button
            onClick={submitAnswer}
            disabled={!selectedAnswer || isTimerExpired}
            className="cursor-pointer disabled:opacity-40 h-9 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 border-0 w-full sm:w-auto"
          >
            {isTimerExpired ? "Time's up!" : "Submit"}
          </Button>
        ) : (
          <Button
            onClick={nextQuestion}
            disabled={isSubmitting}
            className="cursor-pointer h-9 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 border-0 w-full sm:w-auto"
          >
            {currentQuestionIndex < questionCount - 1 ? "Next" : "See results"}
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
