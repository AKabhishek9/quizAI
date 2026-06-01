"use client";

import { useReducedMotion, motion } from "framer-motion";

/**
 * QuizCelebration — lightweight, dependency-free confetti burst rendered with
 * Framer Motion. Shown once on a strong result (score ≥ threshold in the caller).
 * Respects prefers-reduced-motion (renders nothing when reduced motion is set).
 * Purely decorative — pointer-events disabled, aria-hidden.
 */

const COLORS = [
  "var(--primary)",
  "var(--success)",
  "var(--warning)",
  "var(--destructive)",
];

// Deterministic pseudo-spread so we don't need Math.random (and SSR-safe).
const PIECES = Array.from({ length: 28 }, (_, i) => {
  const angle = (i / 28) * Math.PI * 2;
  return {
    id: i,
    x: Math.cos(angle) * (60 + (i % 5) * 26),
    y: Math.sin(angle) * (50 + (i % 4) * 22) - 40,
    rotate: (i % 2 === 0 ? 1 : -1) * (120 + i * 14),
    color: COLORS[i % COLORS.length],
    delay: (i % 6) * 0.03,
    size: 6 + (i % 3) * 3,
  };
});

export function QuizCelebration({ show }: { show: boolean }) {
  const reduce = useReducedMotion();
  if (!show || reduce) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 flex justify-center overflow-visible"
    >
      <div className="relative h-0 w-0">
        {PIECES.map((p) => (
          <motion.span
            key={p.id}
            initial={{ opacity: 0, x: 0, y: 0, rotate: 0, scale: 0.6 }}
            animate={{
              opacity: [0, 1, 1, 0],
              x: p.x,
              y: [0, p.y, p.y + 120],
              rotate: p.rotate,
              scale: 1,
            }}
            transition={{ duration: 1.1, delay: p.delay, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "absolute",
              width: p.size,
              height: p.size * 0.6,
              borderRadius: 2,
              backgroundColor: p.color,
            }}
          />
        ))}
      </div>
    </div>
  );
}
