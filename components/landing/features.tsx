"use client";

import { motion } from "framer-motion";
import { Brain, BarChart3, Target, Timer, Layers, Zap } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Adaptive questions",
    description: "Questions evolve based on your accuracy, pushing your limits without frustration.",
  },
  {
    icon: BarChart3,
    title: "Performance analytics",
    description: "Granular breakdowns of your speed, accuracy, and improvement over time.",
  },
  {
    icon: Target,
    title: "Weak spot detection",
    description: "Our engine pinpoints exactly which sub-topics need more of your attention.",
  },
  {
    icon: Timer,
    title: "Timed challenges",
    description: "Simulate real interview pressure with timed mock exams and technical screens.",
  },
  {
    icon: Layers,
    title: "Difficulty levels",
    description: "From Junior to Staff Engineer. Choose your path and master the stack.",
  },
  {
    icon: Zap,
    title: "Instant feedback",
    description: "Don't just see the answer. Get detailed technical explanations for every choice.",
  },
];

export function Features() {
  return (
    <section className="py-20 relative bg-muted/30 border-y border-border" id="features">
      <div className="max-w-2xl lg:max-w-7xl mx-auto px-4 relative z-10">
        <div className="mb-16">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border mb-6"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">Core Paradigms</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground font-heading"
          >
            Engineered for growth.
          </motion.h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-card border border-border p-8 rounded-2xl transition-all duration-200 hover:border-primary/40"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 transition-all duration-200">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-foreground mb-3 font-heading">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
