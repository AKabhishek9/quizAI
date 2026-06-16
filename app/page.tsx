"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { InAction } from "@/components/landing/in-action";
import { CtaSection } from "@/components/landing/cta-section";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 flex flex-col">
      <Navbar />
      {/* pt accounts for fixed navbar: 64px top row + ~44px mobile link row on small screens */}
      <main className="flex-1 pt-[100px] lg:pt-16">
        <Hero />
        <Features />
        <HowItWorks />
        <InAction />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
