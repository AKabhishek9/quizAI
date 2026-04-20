"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Sparkles } from "lucide-react";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background flex">
        {/* Sidebar — fixed left, desktop only */}
        <Sidebar />

        {/* Mobile Top Bar */}
        <div className="lg:hidden h-14 fixed top-0 inset-x-0 bg-background border-b border-border flex items-center justify-between px-4 z-40">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-primary-foreground fill-current" />
            </div>
            <span className="text-sm font-semibold">QuizAI</span>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <MobileNav />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 ml-0 lg:ml-[220px]">
          <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
            <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
