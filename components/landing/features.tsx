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
    <section className="py-32 relative overflow-hidden" id="features">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="mb-24">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10 mb-6"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-black tracking-[0.2em] text-primary uppercase">Core Paradigms</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-7xl font-black tracking-tighter text-foreground font-heading uppercase italic"
          >
            Engineered for <br/>
            <span className="text-primary not-italic">Hyper-Growth.</span>
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
              className="bg-card/30 border border-border/40 p-12 rounded-[40px] whisper-shadow backdrop-blur-xl group hover:bg-card/40 transition-all duration-500 hover:border-primary/20"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10 mb-8 group-hover:bg-primary group-hover:shadow-glow-primary transition-all duration-500">
                <span className="material-symbols-outlined text-[28px] text-primary group-hover:text-primary-foreground transition-colors">{feature.icon}</span>
              </div>
              <h3 className="text-2xl font-black tracking-tighter text-foreground font-heading lowercase mb-4 group-hover:text-primary transition-colors italic">{feature.title}</h3>
              <p className="text-[15px] text-muted-foreground/60 leading-relaxed font-bold tracking-tight">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
