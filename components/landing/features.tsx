"use client";

import { motion } from "framer-motion";
import { Brain, BarChart3, Target, Timer, Layers, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/layout/container";

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
    <section className="space-section relative bg-muted/30 border-y border-border" id="features">
      <Container className="relative z-10">
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
            className="text-section text-foreground"
          >
            Engineered for growth.
          </motion.h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
          {features.map((feature, idx) => {
            const isHero = idx === 0 || idx === 5;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                  "bg-card border border-border p-8 rounded-2xl transition-all duration-200 hover:border-primary/40 relative overflow-hidden group",
                  isHero ? "md:col-span-2 lg:col-span-2" : "col-span-1 lg:col-span-1"
                )}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 transition-all duration-200 group-hover:scale-110 relative z-10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className={cn(
                  "font-semibold tracking-tight text-foreground mb-3 font-heading relative z-10",
                  isHero ? "text-2xl" : "text-lg"
                )}>
                  {feature.title}
                </h3>
                <p className={cn(
                  "text-muted-foreground leading-relaxed relative z-10",
                  isHero ? "text-base max-w-md" : "text-sm"
                )}>
                  {feature.description}
                </p>

                {isHero && (
                  <div className="absolute right-0 bottom-0 opacity-[0.03] pointer-events-none transform translate-x-1/4 translate-y-1/4 transition-transform duration-500 group-hover:scale-110">
                    <feature.icon className="w-64 h-64 text-foreground" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

