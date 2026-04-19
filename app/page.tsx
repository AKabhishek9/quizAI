"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { CtaSection } from "@/components/landing/cta-section";

export default function LandingPage() {
  return (
    <>
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
