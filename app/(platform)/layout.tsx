"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/components/providers/auth-provider";
import { Sparkles, LogOut } from "lucide-react";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout } = useAuth();
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-surface flex overflow-hidden">
        {/* Sidebar - Fixed Left */}
        <Sidebar />

        {/* Mobile Header - Visible on lg < */}
        <div className="lg:hidden h-16 fixed top-0 inset-x-0 bg-background/80 backdrop-blur-xl border-b border-border/10 flex items-center justify-between px-6 z-40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground fill-current" />
            </div>
            <span className="text-sm font-black tracking-tighter uppercase italic">QuizAI</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => logout()}
              className="p-2 text-destructive hover:bg-destructive/10 rounded-full transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
            <MobileNav />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 ml-0 lg:ml-[260px] border-l border-border/10">
          <main className="flex-1 overflow-y-auto scrollbar-thin relative grain pt-16 lg:pt-0">
            {/* Ambient Mesh Background */}
            <div className="absolute top-0 inset-x-0 h-[600px] w-full mesh-gradient pointer-events-none -z-10 opacity-60" />
            
            <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 py-8 md:py-12 relative z-0">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
