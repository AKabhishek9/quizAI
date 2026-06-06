"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomeBannerProps {
  profile?: {
    name: string;
    xp?: number;
  };
  stats?: {
    currentStreak: number;
  };
}

export function WelcomeBanner({ profile }: WelcomeBannerProps) {
  const firstName = profile?.name?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex flex-col gap-4 rounded-xl card-base p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {greeting}, {firstName} <span aria-hidden="true">👋</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Keep learning, keep growing
        </p>
      </div>
      <Button
        render={<Link href="/quiz" />}
        size="lg"
        className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold transition-colors hover:bg-primary-hover cursor-pointer sm:w-auto"
      >
        Start Quiz
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
