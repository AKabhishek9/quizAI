import { Badge } from "@/components/ui/badge";
import type { Difficulty } from "@/lib/types";
import { cn } from "@/lib/utils";

interface DifficultyBadgeProps {
  difficulty: "easy" | "medium" | "hard" | number | string;
  className?: string;
}

const difficultyConfig = {
  easy: {
    label: "Easy",
    className: "bg-green-50 text-green-600 border-green-200 dark:bg-green-900/10 dark:text-green-400 dark:border-green-800/30",
  },
  medium: {
    label: "Medium",
    className: "bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-900/10 dark:text-yellow-400 dark:border-yellow-800/30",
  },
  hard: {
    label: "Hard",
    className: "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/10 dark:text-red-400 dark:border-red-800/30",
  },
};

function getDifficultyConfig(difficulty: "easy" | "medium" | "hard" | number | string) {
  if (typeof difficulty === "number" || !isNaN(Number(difficulty))) {
    const num = Number(difficulty);
    if (num <= 2) return difficultyConfig.easy;
    if (num === 3) return difficultyConfig.medium;
    return difficultyConfig.hard;
  }
  
  const key = String(difficulty).toLowerCase() as keyof typeof difficultyConfig;
  return difficultyConfig[key] || difficultyConfig.medium; // Fallback
}

export function DifficultyBadge({ difficulty, className }: DifficultyBadgeProps) {
  const config = getDifficultyConfig(difficulty);

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-medium border",
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  );
}
