"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const ease = [0.25, 0.1, 0.25, 1] as [number, number, number, number];

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-36 pb-24 sm:pt-44 sm:pb-32">
      {/* Subtle mesh gradient — not flashy orbs */}
      <div className="pointer-events-none absolute inset-0 -z-10 mesh-gradient" />
      <div className="pointer-events-none absolute inset-0 -z-10 grain" />

      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          {/* Pill — understated */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Now in public beta
          </motion.div>

          {/* Heading — clean, no gradient text */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease }}
            className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-[56px] lg:leading-[1.08]"
          >
            The quiz platform
            <br />
            for developers
          </motion.h1>

          {/* Sub — generous line-height, muted */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16, ease }}
            className="mt-5 text-base text-muted-foreground leading-relaxed max-w-lg mx-auto"
          >
            Adaptive assessments that identify gaps in your knowledge.
            Track progress, fix weak spots, and ship with confidence.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24, ease }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link href="/login">
              <Button
                size="lg"
                className="cursor-pointer h-10 px-5 text-sm font-medium glow"
              >
                Start for free
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
            <Link href="/quiz">
              <Button
                variant="outline"
                size="lg"
                className="cursor-pointer h-10 px-5 text-sm font-medium"
              >
                Browse quizzes
              </Button>
            </Link>
          </motion.div>

          {/* Social proof — very understated */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4, ease }}
            className="mt-10 text-xs text-muted-foreground"
          >
            Trusted by 2,000+ developers at companies you know
          </motion.p>
        </div>
      </div>
    </section>
  );
}
