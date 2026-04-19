"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "1",
    title: "Choose your stack",
    description: "Select from over 50+ languages and frameworks, from Rust and Go to React and GraphQL.",
  },
  {
    number: "2",
    title: "Identify the gaps",
    description: "Take an initial diagnostic quiz. Our AI maps your knowledge base in minutes.",
  },
  {
    number: "3",
    title: "Targeted practice",
    description: "Receive a personalized curriculum designed to turn your weak spots into strengths.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-8">
        <div className="mb-16">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[11px] font-bold tracking-[0.2em] text-primary mb-4 block"
          >
            HOW IT WORKS
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-headline font-extrabold tracking-tight text-on-surface"
          >
            Three steps to mastery
          </motion.h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, idx) => (
            <motion.div 
              key={step.number}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 + 0.2 }}
              className="space-y-6"
            >
              <div className="w-10 h-10 border border-outline-variant flex items-center justify-center font-headline font-bold text-primary rounded-lg bg-surface-container-lowest">
                {step.number}
              </div>
              <h3 className="text-xl font-headline font-bold text-on-surface">{step.title}</h3>
              <p className="text-on-surface-variant leading-relaxed text-sm">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
