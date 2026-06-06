"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import type { Option } from "@/lib/types";

interface QuizOptionProps {
  option: Option;
  isSelected: boolean;
  isCorrect?: boolean | null;
  isRevealed: boolean;
  correctOptionId?: string;
  onSelect: (optionId: string) => void;
  disabled?: boolean;
}

export function QuizOption({
  option,
  isSelected,
  isCorrect,
  isRevealed,
  correctOptionId,
  onSelect,
  disabled = false,
}: QuizOptionProps) {
  const isThisCorrectAnswer = isRevealed && option.id === correctOptionId;
  const isThisWrongSelected = isRevealed && isSelected && !isCorrect;
  const labelState = isThisCorrectAnswer
    ? "correct"
    : isThisWrongSelected
    ? "wrong"
    : isSelected
    ? "selected"
    : "default";

  return (
    <motion.button
      type="button"
      whileTap={!disabled ? { scale: 0.995 } : {}}
      onClick={() => !disabled && onSelect(option.id)}
      disabled={disabled}
      className={cn(
        "flex w-full cursor-pointer items-center gap-3 overflow-hidden rounded-xl border px-3.5 py-3 text-left leading-tight transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        // Default
        !isSelected && !isRevealed && "border-border bg-card hover:border-primary/40 hover:bg-accent",
        // Selected
        isSelected && !isRevealed && "border-primary bg-primary/10",
        // Correct
        isThisCorrectAnswer && "border-success/50 bg-success/10",
        // Wrong
        isThisWrongSelected && "border-destructive/50 bg-destructive/10",
        disabled && "cursor-not-allowed"
      )}
      role="radio"
      aria-checked={isSelected}
      aria-label={`Option ${option.label}: ${option.text}`}
    >
      {/* Label */}
      <motion.span
        key={labelState}
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.12 }}
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold transition-colors duration-150",
          !isSelected && !isRevealed && "bg-muted text-muted-foreground",
          isSelected && !isRevealed && "bg-primary text-primary-foreground",
          isThisCorrectAnswer && "bg-success text-success-foreground",
          isThisWrongSelected && "bg-destructive text-destructive-foreground"
        )}
      >
        {isThisCorrectAnswer ? (
          <Check className="h-3 w-3" />
        ) : isThisWrongSelected ? (
          <X className="h-3 w-3" />
        ) : (
          option.label
        )}
      </motion.span>

      <span className={cn(
        "text-sm font-medium flex-1",
        !isSelected && !isRevealed ? "text-foreground" : 
        isSelected && !isRevealed ? "text-primary" :
        isThisCorrectAnswer ? "text-success" :
        isThisWrongSelected ? "text-destructive" :
        "text-muted-foreground"
      )}>{option.text}</span>
    </motion.button>
  );
}
