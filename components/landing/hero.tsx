"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroProductPreview } from "@/components/landing/hero-product-preview";
import { Container } from "@/components/layout/container";

export function Hero() {
  return (
    <header className="relative overflow-hidden py-28 md:py-36">
      {/* Single subtle ambient glow (one texture for the whole page) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none" aria-hidden="true">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[70%] h-[55%] rounded-full bg-gradient-to-b from-primary/12 to-transparent blur-[130px] dark:from-primary/8" />
      </div>

      <Container className="relative z-10">
        <div className="max-w-2xl mx-auto text-center">

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-hero text-foreground mb-6"
          >
            Master Any Subject with AI-Generated Quizzes
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="text-body text-muted-foreground max-w-xl mx-auto mb-10"
          >
            Get personalized quiz questions on any topic instantly. Track weak
            areas, improve daily, and never run out of practice material.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.34, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5"
          >
            <Link href="/login" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="group w-full sm:w-auto shadow-lg shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-primary/30"
              >
                Start Learning Free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/#how-it-works" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto transition-all duration-200 hover:-translate-y-0.5"
              >
                See How It Works
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Product Preview */}
        <HeroProductPreview />

        {/* Trust bar — truthful, claim-based (no fabricated metrics) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-20 pt-10 border-t border-border/60"
        >
          <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
            {[
              "AI-powered questions",
              "Adaptive to your level",
              "New quizzes daily",
              "Free forever",
            ].map((claim, i) => (
              <li key={claim} className="flex items-center gap-3">
                {i > 0 && <span aria-hidden="true" className="hidden sm:inline text-border">·</span>}
                <span className="font-medium text-foreground/80">{claim}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </Container>
    </header>
  );
}
