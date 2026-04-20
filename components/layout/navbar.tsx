"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Zap, Moon, Sun, Monitor, Terminal, ArrowRight, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";
import { sidebarLinks } from "./sidebar";
import { useAuth } from "@/components/providers/auth-provider";

const marketingLinks = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout, user } = useAuth();
  
  const isPlatform = pathname.startsWith("/dashboard") || 
                     pathname.startsWith("/quiz") || 
                     pathname.startsWith("/leaderboard") || 
                     pathname.startsWith("/profile");

  const links = isPlatform ? sidebarLinks : marketingLinks;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav 
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-500",
        scrolled 
          ? "bg-background/40 backdrop-blur-2xl border-b border-border/40 py-3 shadow-soft" 
          : "bg-transparent py-6"
      )}
    >
      <div className="flex justify-between items-center h-16 px-6 md:px-10 max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-primary/10 rounded-[14px] flex items-center justify-center border border-primary/20 transition-all group-hover:scale-105 group-hover:bg-primary group-hover:shadow-glow-primary">
            <Zap className="h-5 w-5 text-primary group-hover:text-primary-foreground fill-current transition-colors" />
          </div>
          <div className="flex flex-col">
            <span className="text-[20px] font-black tracking-tighter text-foreground leading-none font-heading">QuizAI</span>
            <span className="text-[8px] font-black tracking-[0.2em] text-primary uppercase opacity-60">Technical Atelier</span>
          </div>
        </Link>

        {/* Desktop Nav - Only show marketing links or nothing if on platform (sidebar handles it) */}
        {!isPlatform && (
          <div className="hidden md:flex items-center gap-10">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-[13px] font-black uppercase tracking-widest transition-all duration-300 hover:text-primary",
                    isActive ? "text-primary" : "text-muted-foreground/60"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          
          <Link href="/login" className="hidden sm:block">
            <Button className="h-11 px-6 rounded-full bg-primary hover:bg-primary/90 transition-all shadow-glow-primary border-0 text-primary-foreground font-black tracking-tighter cursor-pointer active:scale-95">
              Initiate
            </Button>
          </Link>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger render={
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 rounded-2xl lg:hidden hover:bg-muted/50 border border-border/10 transition-colors"
                aria-label="Toggle Menu"
              >
                <Menu className="h-5 w-5 text-muted-foreground" />
              </Button>
            } />
            <SheetContent side="right" className="w-full sm:w-[400px] border-l border-border/40 bg-card/95 backdrop-blur-2xl p-0 overflow-hidden">
              <div className="flex flex-col h-full">
                <div className="p-8 border-b border-border/40">
                  <SheetTitle className="text-4xl font-black tracking-tighter text-foreground font-heading italic uppercase">Navigation</SheetTitle>
                  <SheetDescription className="text-[12px] text-muted-foreground font-bold tracking-tight opacity-40 mt-1 uppercase tracking-[0.1em]">
                    Access portal terminal
                  </SheetDescription>
                </div>

                <div className="flex-1 p-6 space-y-2 overflow-y-auto">
                  {isPlatform && (
                    <div className="px-6 mb-4">
                      <span className="text-[10px] font-black tracking-[0.2em] text-primary uppercase opacity-60">Overview</span>
                    </div>
                  )}
                  {links.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "group flex items-center justify-between p-6 rounded-[24px] transition-all duration-500",
                          isActive 
                            ? "bg-primary text-primary-foreground shadow-glow-primary" 
                            : "hover:bg-muted/50 text-foreground/80"
                        )}
                      >
                        <div className="flex items-center gap-5">
                          {('icon' in link) && (
                            <div className={cn(
                              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                              isActive ? "bg-white/10" : "bg-primary/5 group-hover:bg-primary/10"
                            )}>
                              {/* @ts-expect-error - Runtime check with 'icon' in link ensures it's safe */}
                              <link.icon className="h-6 w-6" />
                            </div>
                          )}
                          <span className="text-2xl font-black tracking-tighter font-heading uppercase italic">{link.label}</span>
                        </div>
                        <ArrowRight className={cn(
                          "h-5 w-5 transition-transform duration-500",
                          isActive ? "translate-x-0" : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                        )} />
                      </Link>
                    );
                  })}
                </div>

                <div className="p-8 border-t border-border/40 bg-muted/30 space-y-3">
                  {!user ? (
                    <Link href="/login" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full h-16 text-lg font-black tracking-tighter rounded-[24px] bg-primary hover:bg-primary/90 shadow-glow-primary group">
                        Get Started
                        <Zap className="ml-2 h-5 w-5 fill-current transition-transform group-hover:scale-110" />
                      </Button>
                    </Link>
                  ) : (
                    <Button 
                      onClick={() => {
                        logout();
                        setMobileOpen(false);
                      }}
                      variant="destructive"
                      className="w-full h-16 text-lg font-black tracking-tighter rounded-[24px] group"
                    >
                      Terminate Session
                      <LogOut className="ml-2 h-5 w-5 transition-transform group-hover:scale-110" />
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
