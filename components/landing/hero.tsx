"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroProductPreview } from "@/components/landing/hero-product-preview";
import { Container } from "@/components/layout/container";

export function Hero() {
  return (
    <header className="relative overflow-hidden py-20 md:py-28 lg:py-36">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none" aria-hidden="true">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-primary/15 to-transparent blur-[140px] dark:from-primary/8" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-gradient-to-tl from-primary/10 to-transparent blur-[120px] dark:from-primary/5" />
      </div>

      <Container className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left — Text content */}
          <div className="max-w-xl">
            {/* Tag line */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-2 mb-6"
            >
              <span className="text-xs font-medium text-primary/90 tracking-wide">AI-Powered</span>
              <span className="text-muted-foreground/40">•</span>
              <span className="text-xs font-medium text-primary/90 tracking-wide">Personalized</span>
              <span className="text-muted-foreground/40">•</span>
              <span className="text-xs font-medium text-primary/90 tracking-wide">Smart Learning</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-hero text-foreground mb-6"
            >
              Learn anything.{" "}
              <br />
              Quiz on everything{" "}

            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="text-body text-muted-foreground max-w-lg mb-8"
            >
              QuizAI uses advanced AI to generate quizzes from any topic in
              seconds. Practice, track your progress and become better every day.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.34, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row items-start gap-3.5"
            >
              <Link href="/login">
                <Button
                  size="lg"
                  className="group shadow-lg shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-primary/30"
                >
                  Start for Free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/#how-it-works">
                <Button
                  size="lg"
                  variant="outline"
                  className="group transition-all duration-200 hover:-translate-y-0.5"
                >
                  <Play className="mr-2 h-3.5 w-3.5 fill-current" />
                  See how it works
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Right — Product Preview */}
          <div className="relative lg:flex lg:justify-end">
            <HeroProductPreview />
          </div>
        </div>
      </Container>
    </header>
  );
}
