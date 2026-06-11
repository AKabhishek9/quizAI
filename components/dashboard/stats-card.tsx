"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  /** Reserve the orange accent for the dominant metric (e.g. streak). */
  accent?: boolean;
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  accent = false,
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 card-interactive min-w-0",
        className
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          accent ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="h-4 w-4" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5">
          <span className="stat-number text-lg text-foreground">{value}</span>
          {trend && (
            <span
              className={cn(
                "text-[10px] font-medium tabular-nums",
                trend.isPositive ? "text-success" : "text-destructive"
              )}
            >
              {trend.isPositive ? "+" : ""}
              {trend.value}%
            </span>
          )}
        </div>
        <p className="truncate text-[11px] font-medium text-muted-foreground leading-none mt-0.5">
          {title}
        </p>
      </div>
    </div>
  );
}
