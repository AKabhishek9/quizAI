"use client";

import { motion } from "framer-motion";
import { Brain, BarChart3, Target, Timer, Layers, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/layout/container";

const features = [
  {
    icon: Brain,
    title: "Adaptive Questions",
    description:
      "Questions evolve based on your accuracy, pushing your limits without frustration.",
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description:
      "Granular breakdowns of your speed, accuracy, and improvement over time.",
  },
  {
    icon: Target,
    title: "Weak Spot Detection",
    description:
      "Our engine pinpoints exactly which sub-topics need more of your attention.",
  },
  {
    icon: Timer,
    title: "Timed Challenges",
    description:
      "Simulate real exam pressure with timed mock tests and focused practice rounds.",
  },
  {
    icon: Layers,
    title: "Difficulty Levels",
    description:
      "From beginner to advanced. Choose your level and master each subject step by step.",
  },
  {
    icon: Zap,
    title: "Instant Feedback",
    description:
      "Don't just see the answer. Get detailed technical explanations for every choice.",
  },
];

export function Features() {
  return (
    <section className="space-section relative" id="features">
      <Container className="relative z-10">
        <div className="text-center mb-14">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[11px] font-semibold tracking-widest text-primary mb-4 block uppercase"
          >
            Features
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-section text-foreground"
          >
            Built for real learning.
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.07, duration: 0.5 }}
              className="group relative p-6 card-interactive"
            >
              {/* Icon */}
              <div className="w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-105">
                <feature.icon className="h-5 w-5 text-foreground" />
              </div>

              <h3 className="text-[15px] font-semibold tracking-tight text-foreground mb-2 font-heading">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
