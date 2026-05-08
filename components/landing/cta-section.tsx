"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";

export function CtaSection() {
  return (
    <section className="space-section bg-muted/30">
      <Container>
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-4xl rounded-2xl border border-border bg-card p-10 text-center md:p-16"
      >
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-6 font-heading">
            Ready to master your next challenge?
          </h2>
          <p className="text-muted-foreground text-base mb-10 leading-relaxed">
            Join 2,000+ developers sharpening their skills daily. <br className="hidden sm:block"/>
            Free to start, no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto flex items-center justify-center gap-2 transition-transform duration-200 hover:-translate-y-0.5">
                Get started for free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
      </Container>
    </section>
  );
}
