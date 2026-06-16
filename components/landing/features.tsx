"use client";

import { motion } from "framer-motion";
import { Brain, BarChart3, Trophy, Layers, Flame, Zap } from "lucide-react";
import { Container } from "@/components/layout/container";

const features = [
  {
    icon: Brain,
    title: "AI Quiz Generation",
    description:
      "Generate quizzes from any topic in seconds using the power of AI.",
    iconBg: "bg-primary/15",
    iconColor: "text-primary",
  },
  {
    icon: BarChart3,
    title: "Smart Analytics",
    description:
      "Track your performance with detailed analytics and improve consistently.",
    iconBg: "bg-primary/15",
    iconColor: "text-primary",
  },
  {
    icon: Trophy,
    title: "Leaderboards",
    description:
      "Compete with other learners and climb the leaderboard.",
    iconBg: "bg-primary/15",
    iconColor: "text-primary",
  },
  {
    icon: Layers,
    title: "Multiple Difficulty Levels",
    description:
      "Choose the right difficulty for you. Easy, Medium, Hard or Expert.",
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-500",
  },
  {
    icon: Flame,
    title: "Streak & XP System",
    description:
      "Stay consistent, earn XP and level up your learning journey.",
    iconBg: "bg-primary/15",
    iconColor: "text-primary",
  },
  {
    icon: Zap,
    title: "Instant Feedback",
    description:
      "Get instant results and explanations for every question.",
    iconBg: "bg-amber-400/15",
    iconColor: "text-amber-400",
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
            Everything you need to learn{" "}
            <span className="bg-gradient-to-r from-primary via-[#d4943f] to-primary bg-clip-text text-transparent">
              better
            </span>
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
              <div
                className={`w-11 h-11 rounded-xl ${feature.iconBg} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-105`}
              >
                <feature.icon className={`h-5 w-5 ${feature.iconColor}`} />
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
