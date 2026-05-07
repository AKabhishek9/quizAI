"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { PageTransition } from "@/components/shared/page-transition";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const saved = localStorage.getItem("quizai_sidebar_collapsed");
    if (saved === "true") {
      setCollapsed(true);
    }
  }, []);

  const toggleSidebar = () => {
    const newVal = !collapsed;
    setCollapsed(newVal);
    localStorage.setItem("quizai_sidebar_collapsed", String(newVal));
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background flex">
        <a
          href="#platform-main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:ring-2 focus:ring-ring"
        >
          Skip to content
        </a>

        <Sidebar collapsed={collapsed} onToggle={toggleSidebar} />

        <div className="lg:hidden h-14 fixed top-0 inset-x-0 bg-background border-b border-border flex items-center justify-between px-4 z-40">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-primary-foreground fill-current" />
            </div>
            <span className="text-sm font-semibold">QuizAI</span>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Link
              href="/profile"
              aria-label="Open profile"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card"
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-[10px] font-semibold">
                  {(user?.displayName || user?.email || "U").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
            <MobileNav />
          </div>
        </div>

        <div
          className={cn(
            "flex-1 flex flex-col min-w-0 ml-0 transition-all duration-300",
            collapsed ? "lg:ml-[56px]" : "lg:ml-[220px]"
          )}
        >
          <main id="platform-main" className="flex-1 overflow-y-auto pt-14 lg:pt-0">
            <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6">
              <PageTransition>{children}</PageTransition>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
