"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "1",
    title: "Pick a topic",
    description: "Browse quizzes across JavaScript, React, TypeScript, and more.",
  },
  {
    number: "2",
    title: "Take the quiz",
    description: "Answer timed questions with instant explanations after each one.",
  },
  {
    number: "3",
    title: "Review & improve",
    description: "See your weak areas and track improvement over time.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        {/* Header */}
        <div className="max-w-md mb-14">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xs font-medium text-primary tracking-widest uppercase mb-2"
          >
            How it works
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            Three steps to mastery
          </motion.h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-sm font-semibold text-muted-foreground mb-4">
                {step.number}
              </span>
              <h3 className="text-sm font-semibold mb-1.5">{step.title}</h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
