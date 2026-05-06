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
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-3xl font-bold text-foreground tracking-tight">
        {greeting}, {firstName} 👋
      </h1>
      <div>
        <Button render={<Link href="/quiz" />} size="lg" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer">
          Start Quiz
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
