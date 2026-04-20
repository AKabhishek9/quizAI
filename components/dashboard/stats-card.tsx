"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  total?: string | number;
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  total,
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "border border-border rounded-lg p-4 bg-card",
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground font-medium">{title}</span>
        <Icon className="h-4 w-4 text-muted-foreground/60" />
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-semibold text-foreground tabular-nums">
          {value}
        </span>
        {total && (
          <span className="text-xs text-muted-foreground">/ {total}</span>
        )}
      </div>

      <div className="flex items-center justify-between mt-2">
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
        {trend && (
          <span className={cn(
            "text-xs font-medium tabular-nums ml-auto",
            trend.isPositive ? "text-success" : "text-destructive"
          )}>
            {trend.isPositive ? "+" : ""}{trend.value}%
          </span>
        )}
      </div>
    </div>
  );
}
