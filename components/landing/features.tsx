"use client";

import { motion } from "framer-motion";

const features = [
  {
    icon: "psychology",
    title: "Adaptive questions",
    description: "Questions evolve based on your accuracy, pushing your limits without frustration.",
  },
  {
    icon: "analytics",
    title: "Performance analytics",
    description: "Granular breakdowns of your speed, accuracy, and improvement over time.",
  },
  {
    icon: "target",
    title: "Weak spot detection",
    description: "Our engine pinpoints exactly which sub-topics need more of your attention.",
  },
  {
    icon: "timer",
    title: "Timed challenges",
    description: "Simulate real interview pressure with timed mock exams and technical screens.",
  },
  {
    icon: "layers",
    title: "Difficulty levels",
    description: "From Junior to Staff Engineer. Choose your path and master the stack.",
  },
  {
    icon: "bolt",
    title: "Instant feedback",
    description: "Don't just see the answer. Get detailed technical explanations for every choice.",
  },
];

export function Features() {
  return (
    <section className="py-24 border-t border-outline-variant/15" id="features">
      <div className="max-w-7xl mx-auto px-8">
        <div className="mb-16">
          <motion.span 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[11px] font-bold tracking-[0.2em] text-primary mb-4 block"
          >
            FEATURES
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-headline font-extrabold tracking-tight text-on-surface"
          >
            Everything you need to <br/>learn smarter.
          </motion.h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 border border-outline-variant/15 bg-outline-variant/15 gap-px overflow-hidden rounded-2xl">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 + 0.2 }}
              className="bg-background p-10 group hover:bg-surface-container-lowest transition-colors cursor-default"
            >
              <div className="w-10 h-10 flex items-center justify-center text-outline group-hover:text-primary transition-colors mb-6">
                <span className="material-symbols-outlined text-3xl">{feature.icon}</span>
              </div>
              <h3 className="text-[15px] font-bold mb-2 text-on-surface">{feature.title}</h3>
              <p className="text-[13px] text-on-surface-variant leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
