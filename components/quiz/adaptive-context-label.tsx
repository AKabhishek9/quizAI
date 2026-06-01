"use client";

import { Target } from "lucide-react";

/**
 * AdaptiveContextLabel — makes the adaptive engine legible to the user
 * ("why am I seeing this question?"). Purely presentational; the topic is
 * already known to the play page. No business logic.
 */
export function AdaptiveContextLabel({ topic }: { topic?: string }) {
  if (!topic) return null;
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
      <Target className="h-3 w-3 shrink-0" aria-hidden="true" />
      <span>
        Targeting <span className="font-semibold">{topic}</span>
      </span>
    </div>
  );
}
