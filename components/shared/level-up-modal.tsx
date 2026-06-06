"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, Sparkles, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
  xpGained?: number;
}

export function LevelUpModal({ isOpen, onClose, newLevel, xpGained = 50 }: LevelUpModalProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShowContent(true), 500);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-popover border-border p-0 overflow-hidden rounded-xl whisper-shadow">
        <div className="relative p-6 sm:p-10 flex flex-col items-center text-center">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              animate={{ 
                rotate: 360,
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] opacity-5 bg-[radial-gradient(circle,var(--primary)_0%,transparent_70%)]"
            />
          </div>

          {/* Icon Section */}
          <AnimatePresence>
            {showContent && (
              <>
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="relative mb-8"
                >
                  <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center border-4 border-popover shadow-soft relative z-10">
                    <Trophy className="text-primary h-12 w-12" />
                  </div>
                  {/* Floating particles */}
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, x: 0, y: 0 }}
                      animate={{ 
                        scale: [0, 1, 0],
                        x: (i % 2 === 0 ? 1 : -1) * (Math.random() * 60 + 40),
                        y: (i < 3 ? 1 : -1) * (Math.random() * 60 + 40)
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                      className="absolute top-1/2 left-1/2"
                    >
                      <Star className="h-4 w-4 fill-primary text-primary opacity-40" />
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/20 mb-4">
                    <Sparkles className="h-3 w-3 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">New level reached</span>
                  </div>

                  <h2 className="text-3xl font-bold tracking-tight text-foreground font-heading mb-2">
                    Level Up!
                  </h2>
                  <p className="text-muted-foreground text-sm mb-8 px-4 sm:px-8">
                    Great work — you&apos;ve reached <span className="text-foreground">Level {newLevel}</span>. Keep practicing to climb even higher.
                  </p>

                  {/* XP Summary Card */}
                  <div className="bg-muted/40 border border-border rounded-xl p-4 mb-8 flex items-center justify-between w-full max-w-xs mx-auto">
                    <div className="text-left">
                      <p className="text-[10px] uppercase font-semibold tracking-widest text-muted-foreground leading-none mb-1">XP earned</p>
                      <p className="text-xl font-bold tabular-nums text-primary">+{xpGained}</p>
                    </div>
                    <div className="h-10 w-px bg-border" />
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-semibold tracking-widest text-muted-foreground leading-none mb-1">Next level</p>
                      <p className="text-xl font-bold tabular-nums text-foreground">Lvl {newLevel + 1}</p>
                    </div>
                  </div>

                  <Button
                    onClick={onClose}
                    className="w-full h-12 rounded-lg font-semibold group transition-all active:scale-[0.98] hover:bg-primary-hover shadow-glow-primary"
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
