"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  label?: string;
  showPercentage?: boolean;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "success" | "warning" | "destructive" | "neutral";
  className?: string;
}

const sizeMap = {
  sm: "h-1",
  md: "h-1.5",
  lg: "h-2",
};

const colorMap = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  neutral: "bg-on-surface-variant/20",
};

export function ProgressBar({
  value,
  label,
  showPercentage = true,
  size = "md",
  color = "primary",
  className,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("w-full", className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <span className="text-xs font-medium">{label}</span>
          )}
          {showPercentage && (
            <span className="text-xs tabular-nums text-muted-foreground">
              {Math.round(clamped)}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          "w-full rounded-full bg-secondary overflow-hidden",
          sizeMap[size]
        )}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Progress"}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
          className={cn("h-full rounded-full", colorMap[color])}
        />
      </div>
    </div>
  );
}
