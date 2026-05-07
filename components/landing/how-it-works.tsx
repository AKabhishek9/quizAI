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
    <section className="py-20 bg-background border-b border-border">
      <div className="max-w-2xl lg:max-w-7xl mx-auto px-4">
        <div className="mb-16">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[11px] font-medium tracking-widest text-primary mb-4 block uppercase"
          >
            Process
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground font-heading"
          >
            Three steps to mastery.
          </motion.h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <motion.div 
              key={step.number}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 + 0.2 }}
              className="space-y-6"
            >
               <div className="w-10 h-10 border border-border flex items-center justify-center font-semibold text-primary rounded-lg bg-muted shadow-sm">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold text-foreground tracking-tight">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
