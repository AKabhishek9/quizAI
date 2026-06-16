"use client";

import { motion } from "framer-motion";
import { Type, Brain, ClipboardCheck, TrendingUp } from "lucide-react";
import { Container } from "@/components/layout/container";

const steps = [
  {
    number: "1",
    icon: Type,
    title: "Enter a Topic",
    description: "Type any subject or topic you want to learn.",
  },
  {
    number: "2",
    icon: Brain,
    title: "AI Generates Quiz",
    description: "Our AI creates a personalized quiz just for you.",
  },
  {
    number: "3",
    icon: ClipboardCheck,
    title: "Take the Quiz",
    description: "Answer questions and test your knowledge.",
  },
  {
    number: "4",
    icon: TrendingUp,
    title: "Track & Improve",
    description: "Get insights, track progress and level up!",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="space-section relative">
      <Container className="relative z-10">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[11px] font-semibold tracking-widest text-primary mb-4 block uppercase"
          >
            How It Works
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-section text-foreground"
          >
            Simple steps to{" "}
            <span className="bg-gradient-to-r from-primary via-[#d4943f] to-primary bg-clip-text text-transparent">
              smarter learning
            </span>
          </motion.h2>
        </div>

        {/* Steps flow */}
        <div className="relative">
          {/* Connecting line — desktop only */}
          <div
            className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-px"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to right, var(--primary) 0px, var(--primary) 4px, transparent 4px, transparent 12px)",
              opacity: 0.4,
            }}
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
            {steps.map((step, idx) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.12 + 0.15, duration: 0.5 }}
                className="relative flex flex-col items-center text-center"
              >
                {/* Circle icon */}
                <div className="relative z-10 mb-5">
                  <div className="w-20 h-20 rounded-full bg-card border-2 border-border flex items-center justify-center transition-colors duration-300 group">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <step.icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  {/* Dot on the line */}
                  <div
                    className="hidden md:block absolute -bottom-[3px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary"
                    aria-hidden="true"
                  />
                </div>

                {/* Step number */}
                <span className="text-[10px] font-bold tracking-widest text-primary uppercase mb-2">
                  {step.number}. {step.title}
                </span>

                <p className="text-xs text-muted-foreground leading-relaxed max-w-[180px]">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
