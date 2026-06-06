"use client";

import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function QuizPlayPage() {
  const router = useRouter();

  return (
    <div className="max-w-md mx-auto text-center py-20 px-4">
      <div className="card-base p-6">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="font-heading text-base font-medium text-foreground mb-1">
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
