"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  return (
    <section className="py-20 px-4 bg-neutral-50 dark:bg-neutral-800">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto bg-white dark:bg-neutral-900 rounded-2xl p-10 md:p-16 text-center border border-neutral-200 dark:border-neutral-700"
      >
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50 mb-6">
            Ready to master your next challenge?
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-base mb-10 leading-relaxed">
            Join 2,000+ developers sharpening their skills daily. <br className="hidden sm:block"/>
            Free to start, no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-500 transition-all duration-200 flex items-center justify-center gap-2">
                Get started for free
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
