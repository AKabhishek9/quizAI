"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function CtaSection() {
  return (
    <section className="py-24 px-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto bg-on-surface rounded-[32px] sm:rounded-[48px] p-12 sm:p-20 text-center relative overflow-hidden whisper-shadow"
      >
        <div className="absolute inset-0 mesh-gradient-stitch opacity-10"></div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-headline font-extrabold tracking-tight text-white mb-6">
            Ready to master your <br/>next challenge?
          </h2>
          <p className="text-white/60 text-lg mb-10 leading-relaxed">
            Join 2,000+ developers sharpening their skills daily. <br className="hidden sm:block"/>
            Free to start, no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="w-full sm:w-auto">
              <button className="w-full px-8 py-4 bg-white text-on-surface rounded-xl font-bold hover:bg-white/90 transition-all flex items-center justify-center gap-2">
                Get started for free
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
