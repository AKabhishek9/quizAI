"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/layout/container";

const steps = [
  {
    number: "01",
    title: "Choose your subject",
    description:
      "Pick from a range of topics — from general knowledge and aptitude to tech and maths.",
  },
  {
    number: "02",
    title: "Identify the gaps",
    description:
      "Take an initial diagnostic quiz. Our AI maps what you know in minutes.",
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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {steps.map((step, idx) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 + 0.15, duration: 0.5 }}
              className="relative rounded-2xl p-6 card-interactive"
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
