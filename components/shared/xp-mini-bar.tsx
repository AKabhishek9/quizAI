"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserDashboard } from "@/lib/api-client";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";

/**
 * XpMiniBar — compact level + XP progress for the sidebar. Reads the same
 * ['dashboard'] query cache (read-only). Renders nothing until data is ready.
 */
export function XpMiniBar({ className }: { className?: string }) {
  const { user, loading } = useAuth();
  const { data } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getUserDashboard,
    enabled: !loading && !!user,
    staleTime: 60_000,
  });

  const profile = data?.profile;
  if (!profile) return null;

  const pct = profile.xpToNextLevel > 0
    ? Math.min(100, Math.round((profile.xp / profile.xpToNextLevel) * 100))
    : 0;

  return (
    <div className={cn("px-2", className)}>
      <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
        <span className="font-medium">Level {profile.level}</span>
        <span className="tabular-nums">
          {profile.xp}/{profile.xpToNextLevel} XP
        </span>
      </div>
      <div
        className="h-1 w-full rounded-full bg-muted overflow-hidden"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Level ${profile.level} progress: ${pct}%`}
      >
        <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
