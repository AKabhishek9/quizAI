"use client";

export default function StatsSkeleton() {
  return (
    <div
      className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      role="status"
      aria-busy="true"
      aria-label="Loading statistics"
    >
      <div className="h-[64px] rounded-xl bg-muted animate-pulse" />
      <div className="h-[64px] rounded-xl bg-muted animate-pulse" />
      <div className="h-[64px] rounded-xl bg-muted animate-pulse" />
      <div className="h-[64px] rounded-xl bg-muted animate-pulse" />
    </div>
  );
}
