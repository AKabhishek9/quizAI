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
      {/* Ambient glow orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[-8%] w-[45%] h-[45%] rounded-full bg-primary/8 blur-[100px]" />
        <div className="absolute top-[10%] right-[-12%] w-[40%] h-[40%] rounded-full bg-success/6 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[30%] w-[35%] h-[35%] rounded-full bg-primary/5 blur-[100px]" />
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
                className="w-full sm:w-auto border-border/60 bg-card/30 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-card/50"
              >
                See How It Works
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Product Preview */}
        <HeroProductPreview />

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-20 pt-10 border-t border-border/30"
        >
          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-20">
            {[
              { value: "2,000+", label: "Active learners" },
              { value: "50k+", label: "Questions generated" },
              { value: "4", label: "Daily quiz categories" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                  {stat.value}
                </p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </Container>
    </header>
  );
}
