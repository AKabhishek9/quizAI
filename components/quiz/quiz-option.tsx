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

  return (
    <motion.button
      type="button"
      whileTap={!disabled ? { scale: 0.995 } : {}}
      onClick={() => !disabled && onSelect(option.id)}
      disabled={disabled}
      className={cn(
        "w-full flex items-center gap-3 p-3.5 rounded-lg border text-left transition-all duration-150 cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
        // Default
        !isSelected && !isRevealed && "border-border hover:border-primary/30 hover:bg-secondary/40",
        // Selected
        isSelected && !isRevealed && "border-primary/50 bg-primary/[0.04]",
        // Correct
        isThisCorrectAnswer && "border-success/50 bg-success/[0.04]",
        // Wrong
        isThisWrongSelected && "border-destructive/50 bg-destructive/[0.04]",
        disabled && "cursor-not-allowed"
      )}
      role="radio"
      aria-checked={isSelected}
      aria-label={`Option ${option.label}: ${option.text}`}
    >
      {/* Label */}
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-semibold transition-colors duration-150",
          !isSelected && !isRevealed && "bg-secondary text-muted-foreground",
          isSelected && !isRevealed && "bg-primary text-primary-foreground",
          isThisCorrectAnswer && "bg-success text-success-foreground",
          isThisWrongSelected && "bg-destructive text-white"
        )}
      >
        {isThisCorrectAnswer ? (
          <Check className="h-3.5 w-3.5" />
        ) : isThisWrongSelected ? (
          <X className="h-3.5 w-3.5" />
        ) : (
          option.label
        )}
      </span>

      <span className="text-[13px] font-medium flex-1">{option.text}</span>
    </motion.button>
  );
}
