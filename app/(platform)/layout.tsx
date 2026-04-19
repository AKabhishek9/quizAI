"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { AuthProvider } from "@/components/providers/auth-provider";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-surface flex overflow-hidden">
        {/* Sidebar - Fixed Left */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 ml-0 lg:ml-[260px] border-l border-border/10">
          <Header />
          
          <main className="flex-1 overflow-y-auto scrollbar-thin relative grain">
            {/* Ambient Mesh Background */}
            <div className="absolute top-0 inset-x-0 h-[600px] w-full mesh-gradient-stitch pointer-events-none -z-10 opacity-60" />
            
            <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 py-8 md:py-12 relative z-0">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
