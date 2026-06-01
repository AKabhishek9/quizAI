"use client";

import { useQuery } from "@tanstack/react-query";
import { Flame } from "lucide-react";
import { getUserDashboard } from "@/lib/api-client";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";

/**
 * StreakBadge — compact, always-visible streak indicator for the sidebar and
 * mobile header. Reads the SAME ['dashboard'] query cache the dashboard/profile
 * pages already populate (read-only — no new requests, no business logic).
 *
 * Renders nothing until data is available, so it degrades gracefully on pages
 * that haven't fetched the dashboard yet.
 */
export function StreakBadge({
  collapsed = false,
  className,
}: {
  collapsed?: boolean;
  className?: string;
}) {
  const { user, loading } = useAuth();
  const { data } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getUserDashboard,
    enabled: !loading && !!user,
    staleTime: 60_000,
  });

  const streak = data?.stats?.currentStreak;
  if (streak === undefined) return null;

  const atRisk = streak === 0;
  const label = `${streak} day streak`;

  if (collapsed) {
    return (
      <div
        title={label}
        aria-label={label}
        className={cn(
          "flex items-center justify-center h-8 w-8 rounded-md bg-warning/10",
          className
        )}
      >
        <Flame className={cn("h-4 w-4", atRisk ? "text-muted-foreground" : "text-warning")} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-2 py-1.5 rounded-md bg-warning/10",
        className
      )}
    >
      <Flame
        className={cn("h-3.5 w-3.5 shrink-0", atRisk ? "text-muted-foreground" : "text-warning fill-warning")}
        aria-hidden="true"
      />
      <span className={cn("text-xs font-semibold", atRisk ? "text-muted-foreground" : "text-warning")}>
        {atRisk ? "Start a streak" : label}
      </span>
    </div>
  );
}
