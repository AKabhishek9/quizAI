"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomeBannerProps {
  profile?: {
    name: string;
  };
}

export function WelcomeBanner({ profile }: WelcomeBannerProps) {
  const firstName = profile?.name?.split(" ")[0] ?? "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          {greeting}, {firstName} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Continue your learning streak today.
        </p>
      </div>

      <Link href="/quiz">
        <Button size="sm" className="h-9 px-4 text-sm cursor-pointer gap-1.5">
          Start Quiz
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </Link>
    </div>
  );
}
