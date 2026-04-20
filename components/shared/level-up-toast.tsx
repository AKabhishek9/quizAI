"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Sparkles, X, ArrowRight, Zap } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LevelUpToastProps {
  level: number;
  xpGained: number;
  onClose: () => void;
  show: boolean;
}

export function LevelUpToast({ level, xpGained, onClose, show }: LevelUpToastProps) {

  return (
    <AnimatePresence mode="wait">
      {show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none p-6">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/20 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 40, rotateX: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            className="relative w-full max-w-lg bg-card border border-primary/20 rounded-[40px] shadow-glow-primary p-12 overflow-hidden pointer-events-auto elevated whisper-shadow"
          >
            {/* Animated Background Particles */}
            <div className="absolute inset-0 overflow-hidden opacity-20">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [-20, -100],
                    x: [0, (i % 2 === 0 ? 20 : -20)],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                  className="absolute"
                  style={{
                    left: `${10 + i * 20}%`,
                    bottom: "-20px",
                  }}
                >
                  <Sparkles className="w-4 h-4 text-primary" />
                </motion.div>
              ))}
            </div>

            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative z-10 text-center space-y-8">
              {/* Level Badge Animation */}
              <div className="flex justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                  <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-primary to-primary-foreground flex items-center justify-center border-4 border-background shadow-xl">
                    <span className="text-4xl font-black text-background">
                      {level}
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-2 border-2 border-dashed border-primary/30 rounded-full"
                  />
                </motion.div>
              </div>

              <div className="space-y-3">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="text-3xl font-black tracking-tight flex items-center justify-center gap-3">
                    <Trophy className="w-8 h-8 text-amber-500" />
                    LEVEL UP!
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    Your skills are evolving. Technical mastery attained.
                  </p>
                </motion.div>
              </div>

              {/* XP Summary */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-2 gap-4"
              >
                <div className="bg-muted/50 rounded-2xl p-4 border border-border/50">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-1">
                    XP Gained
                  </div>
                  <div className="text-2xl font-black text-primary flex items-center justify-center gap-1">
                    <Zap className="w-5 h-5 fill-primary" />
                    +{xpGained}
                  </div>
                </div>
                <div className="bg-muted/50 rounded-2xl p-4 border border-border/50">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-1">
                    Progression
                  </div>
                  <div className="text-2xl font-black flex items-center justify-center gap-1">
                    Next Level
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  onClick={onClose}
                  className="w-full h-14 rounded-2xl text-lg font-bold group"
                >
                  CONTINUE ASCENT
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
