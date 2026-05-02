"use client";

import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function QuizPlayPage() {
  const router = useRouter();

  return (
    <div className="max-w-md mx-auto text-center py-20 px-4">
      <div className="rounded-xl border border-border bg-card p-8">
        <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
        <h2 className="text-base font-semibold text-foreground mb-1">
          Quiz not available
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          This quiz route is no longer connected to a saved quiz library item.
          Start a fresh adaptive quiz instead.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/quiz")}
            className="cursor-pointer"
          >
            Daily Quests
          </Button>
          <Button
            size="sm"
            onClick={() => router.push("/quiz/stream")}
            className="cursor-pointer"
          >
            Custom Quiz
            <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
