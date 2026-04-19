"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const ease = [0.25, 0.1, 0.25, 1] as [number, number, number, number];

export function Hero() {
  return (
    <header className="relative pt-40 pb-28 mesh-gradient-stitch overflow-hidden">
      <div className="max-w-4xl mx-auto text-center px-8">
        {/* Pill */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-outline-variant/30 bg-surface-container-lowest text-xs font-medium text-on-surface-variant mb-10"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Now in public beta
        </motion.div>

        {/* Heading */}
        <motion.h1 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease }}
          className="text-[40px] sm:text-[56px] leading-[1.1] font-headline font-extrabold tracking-tighter text-on-surface mb-6"
        >
          The quiz platform for <br/>
          <span className="text-primary">developers.</span>
        </motion.h1>

        {/* Sub */}
        <motion.p 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease }}
          className="text-base sm:text-lg text-on-surface-variant max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Adaptive assessments that identify gaps in your knowledge. Track progress, fix weak spots, and ship with confidence.
        </motion.p>

        {/* Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/login" className="w-full sm:w-auto">
            <button className="w-full px-8 py-4 bg-primary text-on-primary rounded-xl font-bold whisper-shadow hover:bg-primary-container transition-all flex items-center justify-center gap-2">
              Start for free
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </Link>
          <Link href="/quiz" className="w-full sm:w-auto">
            <button className="w-full px-8 py-4 border border-outline-variant text-on-surface font-bold rounded-xl hover:bg-surface-container-low transition-all">
              Browse quizzes
            </button>
          </Link>
        </motion.div>

        {/* Social Proof */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-24"
        >
          <p className="text-sm font-medium text-outline mb-8">Trusted by 2,000+ developers at companies you know</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale">
            <img alt="GitHub" className="h-6" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvdMzjlG6tWvMDf7xo3pBuMfadklyDPGYNmYUh_N5LS87bP_A1qbC4dFUh4KchiBo1SfXB0-VPGZBdnoDd7zm6r8XSjbLdl5BIDDN0HMUuhk1MW7IqlFsm07MkJOG4FHdKHoCFbOq3fdqniG28SHMNSUud2FBDzGXZkEtsG48L5P99Sh-wZ6uuGyarufxqybskPdSL4aPDhzFvlyt2K5mv5Zn3lK2X_PjJHZ5xu1a6kiT3Lslqw_AfXmiViw_pFKOrFjG4f7dDV6GS"/>
            <img alt="Vercel" className="h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDE12aS7gZh-dfHg1Cdc9PR-UfZEziEuTnCd-uLfT_0Mye-LBqnGROHfE2AeaNecQppBOTdbuXB7GTDg4RcrH97tUE3y3iNyktcAkONuISBZlfbmHXE7vBLQf9O6_9OMXBgtlnTWmrYzD6oM7AmBS4z_1n8aiR3nprSDlWF1rf-MkFynuTbQ8N3e0_7Pkc3WB36XeAHHyLcrecRvqJB9g69I4LgclnZueDhbjn1anz0OXgQVU7DNy6nHXwAMecAguZ8ON93b_W16qpn"/>
            <img alt="Stripe" className="h-6" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6JZQVpfB4a6nbzOvibJHAgOmJKv8YoYcUBA3qlkO95f1tsMR99-xKLE87CS-mxypEIEWFapToM33xVGxbzptfSFAC-PnyNpkLurYgTRIDxA9M3myMzSkPbOC5yVep_x6EZsbYLdx3sq2S0cENPuz5Sko4J1_SF4o2ydYQyINeVeJ6uihd9nNOQHT3U_UpxN9dj78SOry_dO7Aw1k1oZxFWq7sjUH7s2XI_E4iQBhO48NStsc52RdSMBXnWuh1fKvveC2wiAZNSFIR"/>
            <img alt="Linear" className="h-6" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGuHlnlyOQTebwKdJMyYCTKXkKvN6TzXJelhAQvMjQksKFtqo9Rc1aMShwqDjxHBIMJUUwyAnnA6UYlS5EUPVxyFaA_FtiyHMa-9S8UN-tq5uaNMRsxLalFQlmXONGFllMI87t-kFjmUEZapefmzIMEkh_cwl5cFopVB0lc2JIN42YdgJy-OW1SfPo7zF2kEGSX8hZAiLGbaY1Ol079aEQ5QPDnATskbpORqQCdVoKHG2gqI37F8c2RoEKzQ3SFIdb65jrEu2qZaWD"/>
          </div>
        </motion.div>
      </div>
    </header>
  );
}
