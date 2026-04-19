"use client";

import { motion } from "framer-motion";
import { Brain, BarChart3, Target, Clock, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Adaptive questions",
    description:
      "Questions calibrate to your level automatically.",
  },
  {
    icon: BarChart3,
    title: "Performance analytics",
    description:
      "Track scores, trends, and category breakdowns.",
  },
  {
    icon: Target,
    title: "Weak spot detection",
    description:
      "Surface the topics that need the most attention.",
  },
  {
    icon: Clock,
    title: "Timed challenges",
    description:
      "Simulate real exam pressure with configurable timers.",
  },
  {
    icon: Shield,
    title: "Difficulty levels",
    description:
      "Easy, medium, and hard — progress at your pace.",
  },
  {
    icon: Zap,
    title: "Instant feedback",
    description:
      "Explanations after every answer, not just a score.",
  },
];

export function Features() {
  return (
    <section className="py-24 sm:py-32 border-t border-border" id="features">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        {/* Header */}
        <div className="max-w-md mb-14">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xs font-medium text-primary tracking-widest uppercase mb-2"
          >
            Features
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            Everything you need to learn smarter
          </motion.h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden border border-border">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06, duration: 0.4 }}
                className="bg-card p-7 sm:p-8 group cursor-pointer transition-colors duration-200 hover:bg-secondary/40"
              >
                <Icon className="h-5 w-5 text-muted-foreground mb-4 group-hover:text-primary transition-colors duration-200" />
                <h3 className="text-sm font-semibold mb-1.5">
                  {feature.title}
                </h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
