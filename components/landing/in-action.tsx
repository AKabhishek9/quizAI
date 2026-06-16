"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";

const highlights = [
  "Generate quizzes on any topic",
  "Choose difficulty level",
  "Get instant explanations",
  "Track your performance",
];

const QUIZ_OPTIONS = [
  { label: "A", text: "Array", selected: false },
  { label: "B", text: "Queue", selected: false },
  { label: "C", text: "Stack", selected: true, correct: true },
  { label: "D", text: "Linked List", selected: false },
];

export function InAction() {
  return (
    <section className="space-section relative">
      <Container className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — text + checklist */}
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-section text-foreground mb-8"
            >
              See QuizAI{" "}
              <span className="bg-gradient-to-r from-primary via-[#d4943f] to-primary bg-clip-text text-transparent">
                in action
              </span>
            </motion.h2>

            <div className="space-y-4">
              {highlights.map((item, idx) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 + 0.2, duration: 0.4 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/15">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{item}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right — quiz demo mockup */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              {/* Quiz question card */}
              <div className="flex-1 card-base p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium text-muted-foreground">
                    Question 4 of 10
                  </span>
                </div>

                <p className="text-sm font-semibold text-foreground leading-relaxed font-heading">
                  Which data structure uses LIFO principle?
                </p>

                <div className="space-y-2">
                  {QUIZ_OPTIONS.map((opt) => (
                    <div
                      key={opt.label}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs border transition-colors ${
                        opt.correct && opt.selected
                          ? "border-emerald-500/50 bg-emerald-500/10 text-foreground font-semibold"
                          : "border-border/30 bg-muted/10 text-muted-foreground"
                      }`}
                    >
                      {opt.correct && opt.selected ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      ) : (
                        <Circle className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0" />
                      )}
                      <span className="font-semibold">{opt.label}.</span>
                      <span>{opt.text}</span>
                    </div>
                  ))}
                </div>

                <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold transition-colors hover:bg-primary-hover w-fit">
                  Next Question
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              {/* Score card */}
              <div className="sm:w-44 w-full card-base p-5 flex flex-col items-center justify-center text-center gap-3">
                {/* Circular progress */}
                <div className="relative w-20 h-20">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      fill="none"
                      stroke="var(--border)"
                      strokeWidth="5"
                    />
                    <motion.circle
                      cx="40"
                      cy="40"
                      r="34"
                      fill="none"
                      stroke="var(--primary)"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 34}
                      initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                      whileInView={{ strokeDashoffset: 2 * Math.PI * 34 * 0.2 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary tabular-nums">80%</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-bold text-foreground font-heading">Great Job!</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">You scored 8/10</p>
                </div>

                <div className="flex items-center gap-3 text-[10px] tabular-nums">
                  <span className="text-emerald-500 font-medium">✓ 8</span>
                  <span className="text-destructive font-medium">✗ 2</span>
                </div>

                <button className="text-[10px] text-primary font-semibold hover:underline">
                  View Explanation →
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
