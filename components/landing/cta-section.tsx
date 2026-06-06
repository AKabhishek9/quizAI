"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
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
          className="mx-auto max-w-3xl p-10 text-center md:p-14 card-base"
        >
          <span className="text-[11px] font-semibold tracking-widest text-primary uppercase mb-4 block">
            Start free today
          </span>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground mb-4 font-heading">
            Ready to master your next subject?
          </h2>
          <p className="text-muted-foreground text-sm mb-8 leading-relaxed max-w-lg mx-auto">
            Practice smarter with quizzes that adapt to your level.{" "}
            <br className="hidden sm:block" />
            No credit card. No time limit. Always free.
          </p>
          <Link href="/login">
            <Button
              size="lg"
              className="shadow-lg shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-primary/30"
            >
              Get started for free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </Container>
    </section>
  );
}
