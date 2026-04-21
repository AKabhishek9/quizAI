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
        "w-full flex items-center gap-3 py-2 px-3 rounded-lg border text-left transition-all duration-150 cursor-pointer overflow-hidden leading-tight",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40",
        // Default
        !isSelected && !isRevealed && "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 hover:border-neutral-300 dark:hover:border-neutral-600",
        // Selected
        isSelected && !isRevealed && "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20",
        // Correct
        isThisCorrectAnswer && "border-green-500/50 bg-green-50 dark:bg-green-900/20",
        // Wrong
        isThisWrongSelected && "border-red-500/50 bg-red-50 dark:bg-red-900/20",
        disabled && "cursor-not-allowed"
      )}
      role="radio"
      aria-checked={isSelected}
      aria-label={`Option ${option.label}: ${option.text}`}
    >
      {/* Label */}
      <span
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold transition-colors duration-150",
          !isSelected && !isRevealed && "bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400",
          isSelected && !isRevealed && "bg-indigo-600 text-white",
          isThisCorrectAnswer && "bg-green-500 text-white",
          isThisWrongSelected && "bg-red-500 text-white"
        )}
      >
        {isThisCorrectAnswer ? (
          <Check className="h-3 w-3" />
        ) : isThisWrongSelected ? (
          <X className="h-3 w-3" />
        ) : (
          option.label
        )}
      </span>

      <span className={cn(
        "text-sm font-medium flex-1",
        !isSelected && !isRevealed ? "text-neutral-900 dark:text-neutral-100" : 
        isSelected && !isRevealed ? "text-indigo-900 dark:text-indigo-100" :
        isThisCorrectAnswer ? "text-green-900 dark:text-green-100" :
        "text-red-900 dark:text-red-100"
      )}>{option.text}</span>
    </motion.button>
  );
}
