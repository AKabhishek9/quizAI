"use client";

export default function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="h-12 rounded bg-muted animate-pulse" />
      <div className="h-12 rounded bg-muted animate-pulse" />
      <div className="h-12 rounded bg-muted animate-pulse" />
    </div>
  );
}
