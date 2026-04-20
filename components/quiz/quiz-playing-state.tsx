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
}: QuizPlayingStateProps) {
  return (
    <div className={cn("max-w-xl mx-auto space-y-5", isDaily && "py-4 space-y-6")}>
      {/* Top bar */}
      <div className={cn("space-y-2.5", isDaily && "space-y-4")}>
        <div className="flex items-center justify-between">
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
            "rounded-lg border border-border bg-card",
            isDaily ? "p-6 min-h-[360px] flex flex-col" : "p-5"
          )}
        >

          <h2 className={cn(
            "font-medium leading-relaxed mb-5",
            isDaily ? "text-lg mb-8 relative z-10" : "text-[15px]"
          )}>
            {currentQuestion?.text}
          </h2>

          <div className={cn("space-y-2", isDaily && "space-y-2.5 mt-auto relative z-10")} role="radiogroup" aria-label="Answer options">
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
                disabled={showFeedback}
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
                  isDaily ? "mt-6 p-4 rounded-xl bg-primary/[0.03] border-primary/10 relative z-10" : "bg-secondary/60 border-border"
                )}
              >
                {isDaily ? (
                  <div className="flex items-center gap-2 mb-2">
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
                  isDaily ? "text-[13px]" : "text-xs"
                )}>
                  {currentQuestion.explanation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {/* Actions */}
      <div className={cn("flex justify-end", isDaily && "pt-2")}>
        {!showFeedback ? (
          <Button
            onClick={submitAnswer}
            disabled={!selectedAnswer}
            size="sm"
            className="cursor-pointer disabled:opacity-40 h-9 text-sm px-6"
          >
            Submit
          </Button>
        ) : (
          <Button
            onClick={nextQuestion}
            size="sm"
            disabled={isSubmitting}
            className="cursor-pointer h-9 text-sm px-6"
          >
            {currentQuestionIndex < questionCount - 1 ? "Next" : "See results"}
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
