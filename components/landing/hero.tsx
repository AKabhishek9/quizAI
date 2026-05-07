"use client";

import Link from "next/link";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroProductPreview } from "@/components/landing/hero-product-preview";

const ease = [0.25, 0.1, 0.25, 1] as [number, number, number, number];

export function Hero() {
  return (
    <header className="relative pt-32 pb-24 overflow-hidden bg-background">
      {/* Background Ambience - Simplified */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[120px] opacity-30" />
      </div>

      <div className="max-w-5xl mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted text-[11px] font-medium tracking-wider text-muted-foreground uppercase mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
          Now in Public Beta
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl md:text-5xl font-semibold tracking-tight text-foreground mb-6 font-heading"
        >
          Master Any Subject with AI-Generated Quizzes
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-base text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed"
        >
          Get personalized quiz questions on any topic instantly. Track weak areas, improve daily, and never run out of practice material.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
        >
          <Link href="/login" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto h-auto px-5 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 border-0 font-medium text-sm cursor-pointer group">
              Start Learning Free
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/#features" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto h-auto px-5 py-2.5 rounded-lg border-border bg-card hover:bg-accent transition-all duration-200 font-medium text-sm cursor-pointer text-foreground">
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
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-20 pt-10 border-t border-border/40"
        >
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-foreground">2,000+</p>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">Active learners</p>
            </div>

            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-foreground">50k+</p>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">Questions generated</p>
            </div>

            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-foreground">4</p>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">Daily quiz categories</p>
            </div>
          </div>
        </motion.div>
      </div>
    </header>
  );
}
