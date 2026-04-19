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
        "rounded-2xl border border-border bg-card p-6 space-y-4",
        className
      )}
      aria-hidden="true"
    >
      <div className="h-4 w-2/3 rounded-md bg-muted animate-pulse" />
      <div className="h-3 w-full rounded-md bg-muted animate-pulse" />
      <div className="h-3 w-4/5 rounded-md bg-muted animate-pulse" />
      <div className="flex gap-2 pt-2">
        <div className="h-6 w-16 rounded-full bg-muted animate-pulse" />
        <div className="h-6 w-12 rounded-full bg-muted animate-pulse" />
      </div>
    </div>
  );
}

export function SkeletonChart({ className }: SkeletonLoaderProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-6 space-y-4",
        className
      )}
      aria-hidden="true"
    >
      <div className="h-4 w-1/3 rounded-md bg-muted animate-pulse" />
      <div className="h-48 w-full rounded-lg bg-muted animate-pulse" />
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-border bg-card p-6 space-y-3"
        >
          <div className="h-3 w-20 rounded-md bg-muted animate-pulse" />
          <div className="h-8 w-16 rounded-md bg-muted animate-pulse" />
          <div className="h-3 w-24 rounded-md bg-muted animate-pulse" />
        </div>
      ))}
    </div>
  );
}
