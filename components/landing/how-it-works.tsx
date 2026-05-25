"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/layout/container";

const steps = [
  {
    number: "01",
    title: "Choose your stack",
    description:
      "Select from over 50+ languages and frameworks, from Rust and Go to React and GraphQL.",
  },
  {
    number: "02",
    title: "Identify the gaps",
    description:
      "Take an initial diagnostic quiz. Our AI maps your knowledge base in minutes.",
  },
  {
    number: "03",
    title: "Targeted practice",
    description:
      "Receive a personalized curriculum designed to turn your weak spots into strengths.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="space-section relative">
      {/* Subtle ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-[-10%] left-[-5%] w-[35%] h-[35%] rounded-full bg-success/4 blur-[100px]" />
      </div>

      <Container className="relative z-10">
        <div className="text-center mb-14">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[11px] font-semibold tracking-widest text-primary mb-4 block uppercase"
          >
            Process
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-section text-foreground"
          >
            Three steps to mastery.
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((step, idx) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 + 0.15, duration: 0.5 }}
              className="relative rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-6 transition-all duration-300 hover:border-primary/30 hover:bg-card/80"
            >
              {/* Step label */}
              <span className="text-[10px] font-bold tracking-widest text-primary uppercase mb-4 block">
                Step {step.number}
              </span>

              <h3 className="text-lg font-semibold text-foreground tracking-tight mb-2.5 font-heading">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
