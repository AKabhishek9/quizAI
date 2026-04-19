"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Zap, Moon, Sun, Monitor, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/quiz", label: "Quizzes" },
  { href: "/profile", label: "Profile" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav 
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        scrolled 
          ? "bg-background/80 dark:bg-background/80 backdrop-blur-xl border-b border-border py-3" 
          : "bg-transparent py-5"
      )}
    >
      <div className="flex justify-between items-center h-16 px-8 max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center transition-transform group-hover:scale-105">
            <span className="material-symbols-outlined text-primary-foreground text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>terminal</span>
          </div>
          <span className="text-2xl font-black tracking-tighter text-foreground font-headline">QuizAI</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 font-headline tracking-tight font-semibold">
          {navLinks.map((link) => {
            const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm transition-all duration-200 relative pb-1",
                  isActive 
                    ? "text-primary border-b-2 border-primary" 
                    : "text-foreground/70 hover:text-primary"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          {/* Only show Get Started if not authenticated or not on platform pages */}
          {!pathname.startsWith("/dashboard") && !pathname.startsWith("/quiz") && !pathname.startsWith("/profile") && (
            <Link href="/login" className="hidden sm:block">
              <button className="bg-primary text-on-primary px-5 py-2 rounded-lg font-bold text-sm whisper-shadow active:scale-95 transition-all hover:bg-primary-container">
                Get Started
              </button>
            </Link>
          )}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 md:hidden"
                />
              }
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[350px] border-l border-outline-variant/15">
              <SheetTitle className="text-xl font-headline font-bold mb-8 text-foreground">Navigation</SheetTitle>
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "text-lg font-headline font-semibold py-2 px-4 rounded-xl transition-colors",
                      pathname === link.href ? "bg-primary/10 text-primary" : "text-foreground/70 hover:bg-muted/50"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                {!pathname.startsWith("/dashboard") && (
                  <div className="pt-4 border-t border-outline-variant/15 mt-4">
                    <Link href="/login" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full py-6 text-base font-headline font-bold rounded-xl bg-primary hover:bg-primary-container">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
