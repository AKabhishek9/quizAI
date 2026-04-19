"use client";

import { Navbar } from "@/components/layout/navbar";
import { AuthProvider } from "@/components/providers/auth-provider";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
        {/* Subtle background effects */}
        <div className="absolute top-0 inset-x-0 h-[500px] w-full bg-gradient-to-b from-primary/5 via-primary/5 to-transparent pointer-events-none -z-10" />
        
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 md:pt-32 md:pb-12 relative z-0">
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}
