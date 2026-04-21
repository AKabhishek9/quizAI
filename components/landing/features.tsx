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
    <section className="py-24 relative bg-white dark:bg-neutral-950" id="features">
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="mb-16">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 mb-6"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
            <span className="text-[11px] font-medium tracking-wider text-neutral-600 dark:text-neutral-400 uppercase">Core Paradigms</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50"
          >
            Engineered for growth.
          </motion.h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 p-8 rounded-2xl transition-all duration-200 hover:border-neutral-300 dark:hover:border-neutral-700"
            >
              <div className="w-10 h-10 rounded-lg bg-white dark:bg-neutral-800 flex items-center justify-center border border-neutral-200 dark:border-neutral-700 mb-6 transition-all duration-200">
                <feature.icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 mb-3">{feature.title}</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
