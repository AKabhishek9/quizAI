"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomeBannerProps {
  profile?: {
    name: string;
  };
}

export function WelcomeBanner({ profile }: WelcomeBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col md:flex-row md:items-end justify-between gap-10 pt-4"
    >
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-black tracking-[0.2em] text-primary uppercase">Telemetry Active</span>
        </div>
        <h1 className="text-6xl font-black tracking-tighter text-foreground font-heading">
          {profile ? `Welcome, ${profile.name.split(" ")[0]} 👋` : "Welcome back, Scholar 👋"}
        </h1>
        <p className="text-[17px] font-bold text-muted-foreground/60 tracking-tight max-w-xl leading-relaxed">
          Your cognitive telemetry indicates an <span className="text-primary italic">optimal path</span> for mastery in technical domains today.
        </p>
      </div>
      
      <Link href="/quiz">
        <Button className="h-16 px-12 rounded-full bg-primary hover:bg-primary/90 transition-all shadow-glow-primary border-0 text-primary-foreground font-black tracking-tighter text-lg cursor-pointer group active:scale-[0.98]">
          Adaptive Mission
          <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Button>
      </Link>
    </motion.div>
  );
}
