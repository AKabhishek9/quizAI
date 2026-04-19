"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="py-24 sm:py-32 border-t border-border">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-xl border border-border bg-card p-10 sm:p-14 text-center"
        >
          {/* Subtle mesh behind */}
          <div className="pointer-events-none absolute inset-0 -z-0 mesh-gradient opacity-50" />

          <div className="relative z-10">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Ready to level up?
            </h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
              Join thousands of developers who use QuizAI to sharpen their
              skills every day. Free to start.
            </p>
            <div className="mt-7">
              <Link href="/login">
                <Button className="cursor-pointer h-10 px-5 text-sm font-medium glow">
                  Get started
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
