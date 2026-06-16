"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";

export function CtaSection() {
  return (
    <section className="space-section relative">
      <Container className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="card-base p-8 md:p-10"
        >
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Rocket className="h-6 w-6 text-primary" />
            </div>

            {/* Text */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground mb-1.5 font-heading">
                Ready to boost your learning?
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Join thousands of students who are already learning smarter with QuizAI.
              </p>
            </div>

            {/* CTA button */}
            <Link href="/login" className="shrink-0">
              <Button
                size="lg"
                className="group shadow-lg shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-primary/30 whitespace-nowrap"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
