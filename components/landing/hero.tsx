"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const ease = [0.25, 0.1, 0.25, 1] as [number, number, number, number];

export function Hero() {
  return (
    <header className="relative pt-32 pb-24 overflow-hidden bg-white dark:bg-neutral-950">
      {/* Background Ambience - Simplified */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-indigo-500/5 blur-[120px] opacity-30" />
      </div>

      <div className="max-w-6xl mx-auto text-center px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-[11px] font-medium tracking-wider text-neutral-600 dark:text-neutral-400 uppercase mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
          Now in Public Beta
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl md:text-5xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50 mb-6"
        >
          Master the Technical Horizon.
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-base text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto mb-10 leading-relaxed"
        >
          Adaptive assessment telemetry that identifies conceptual gaps. Synchronize your knowledge graph, neutralize weak points, and ship with absolute confidence.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6"
        >
          <Link href="/login" className="w-full sm:w-auto">
            <Button className="w-full h-11 px-8 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all duration-200 border-0 font-medium text-sm cursor-pointer group">
              Initiate Discovery
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/quiz" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full h-11 px-8 rounded-lg border-neutral-200 dark:border-neutral-800 bg-transparent hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all duration-200 font-medium text-sm cursor-pointer text-neutral-900 dark:text-neutral-100">
              Explore Repository
            </Button>
          </Link>
        </motion.div>

        {/* Social Proof */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-20"
        >
          <p className="text-[10px] font-medium tracking-widest text-neutral-400 uppercase mb-8">Synchronized with Industry Standards</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-30 grayscale transition-all hover:opacity-50 hover:grayscale-0">
            <Image alt="GitHub" width={100} height={24} className="h-5 w-auto" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvdMzjlG6tWvMDf7xo3pBuMfadklyDPGYNmYUh_N5LS87bP_A1qbC4dFUh4KchiBo1SfXB0-VPGZBdnoDd7zm6r8XSjbLdl5BIDDN0HMUuhk1MW7IqlFsm07MkJOG4FHdKHoCFbOq3fdqniG28SHMNSUud2FBDzGXZkEtsG48L5P99Sh-wZ6uuGyarufxqybskPdSL4aPDhzFvlyt2K5mv5Zn3lK2X_PjJHZ5xu1a6kiT3Lslqw_AfXmiViw_pFKOrFjG4f7dDV6GS"/>
            <Image alt="Vercel" width={100} height={20} className="h-4 w-auto" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDE12aS7gZh-dfHg1Cdc9PR-UfZEziEuTnCd-uLfT_0Mye-LBqnGROHfE2AeaNecQppBOTdbuXB7GTDg4RcrH97tUE3y3iNyktcAkONuISBZlfbmHXE7vBLQf9O6_9OMXBgtlnTWmrYzD6oM7AmBS4z_1n8aiR3nprSDlWF1rf-MkFynuTbQ8N3e0_7Pkc3WB36XeAHHyLcrecRvqJB9g69I4LgclnZueDhbjn1anz0OXgQVU7DNy6nHXwAMecAguZ8ON93b_W16qpn"/>
            <Image alt="Stripe" width={100} height={24} className="h-5 w-auto" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6JZQVpfB4a6nbzOvibJHAgOmJKv8YoYcUBA3qlkO95f1tsMR99-xKLE87CS-mxypEIEWFapToM33xVGxbzptfSFAC-PnyNpkLurYgTRIDxA9M3myMzSkPbOC5yVep_x6EZsbYLdx3sq2S0cENPuz5Sko4J1_SF4o2ydYQyINeVeJ6uihd9nNOQHT3U_UpxN9dj78SOry_dO7Aw1k1oZxFWq7sjUH7s2XI_E4iQBhO48NStsc52RdSMBXnWuh1fKvveC2wiAZNSFIR"/>
            <Image alt="Linear" width={100} height={24} className="h-5 w-auto" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGuHlnlyOQTebwKdJMyYCTKXkKvN6TzXJelhAQvMjQksKFtqo9Rc1aMShwqDjxHBIMJUUwyAnnA6UYlS5EUPVxyFaA_FtiyHMa-9S8UN-tq5uaNMRsxLalFQlmXONGFllMI87t-kFjmUEZapefmzIMEkh_cwl5cFopVB0lc2JIN42YdgJy-OW1SfPo7zF2kEGSX8hZAiLGbaY1Ol079aEQ5QPDnATskbpORqQCdVoKHG2gqI37F8c2RoEKzQ3SFIdb65jrEu2qZaWD"/>
          </div>
        </motion.div>
      </div>
    </header>
  );
}
