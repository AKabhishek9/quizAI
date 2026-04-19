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
    className: "bg-success/10 text-success border-success/20 hover:bg-success/15",
  },
  medium: {
    label: "Medium",
    className: "bg-warning/10 text-warning border-warning/20 hover:bg-warning/15",
  },
  hard: {
    label: "Hard",
    className: "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/15",
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
