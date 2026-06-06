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
  /** Reserve the orange accent for the dominant metric (e.g. streak). */
  accent?: boolean;
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  total,
  accent = false,
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "flex h-full min-w-0 flex-col gap-3 p-4 card-interactive",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg",
            accent ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
        {trend && (
          <span
            className={cn(
              "text-xs font-medium tabular-nums",
              trend.isPositive ? "text-success" : "text-destructive"
            )}
          >
            {trend.isPositive ? "+" : ""}
            {trend.value}%
          </span>
        )}
      </div>

      <div className="min-w-0">
        <div className="flex items-baseline gap-1.5">
          <span className="stat-number text-2xl text-foreground">{value}</span>
          {total && (
            <span className="text-xs text-muted-foreground">/ {total}</span>
          )}
        </div>
        <p className="mt-0.5 truncate text-xs font-medium text-muted-foreground">
          {title}
        </p>
      </div>

      {description && (
        <p className="mt-auto text-[11px] leading-relaxed text-muted-foreground/80">
          {description}
        </p>
      )}
    </div>
  );
}
