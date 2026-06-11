import { cn } from "@/lib/utils";

interface SkeletonLoaderProps {
  className?: string;
}

export function SkeletonLine({ className }: SkeletonLoaderProps) {
  return (
    <div
      className={cn("h-4 rounded-md bg-muted animate-pulse", className)}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard({ className }: SkeletonLoaderProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4 space-y-3",
        className
      )}
      aria-hidden="true"
    >
      <div className="h-3 w-2/3 rounded-md bg-muted animate-pulse" />
      <div className="h-3 w-full rounded-md bg-muted animate-pulse" />
      <div className="h-3 w-4/5 rounded-md bg-muted animate-pulse" />
    </div>
  );
}

export function SkeletonChart({ className }: SkeletonLoaderProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4 space-y-3",
        className
      )}
      aria-hidden="true"
    >
      <div className="h-3 w-1/3 rounded-md bg-muted animate-pulse" />
      <div className="h-[140px] w-full rounded-lg bg-muted animate-pulse" />
    </div>
  );
}

export function SkeletonAvatar({ className }: SkeletonLoaderProps) {
  return (
    <div
      className={cn(
        "h-10 w-10 rounded-full bg-muted animate-pulse",
        className
      )}
      aria-hidden="true"
    />
  );
}

export function SkeletonStatsGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
        >
          <div className="h-9 w-9 shrink-0 rounded-lg bg-muted animate-pulse" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-12 rounded-md bg-muted animate-pulse" />
            <div className="h-3 w-20 rounded-md bg-muted animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
