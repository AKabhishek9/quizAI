"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { ArrowRight, LogOut, Menu, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";
import { platformNavLinks as sidebarLinks } from "./nav-config";
import { useAuth } from "@/components/providers/auth-provider";
import { Container } from "./container";

const marketingLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const lastScrollY = useRef(0);
  const { logout, user } = useAuth();

  const isPlatform =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/quiz") ||
    pathname.startsWith("/leaderboard") ||
    pathname.startsWith("/profile");

  const links = isPlatform ? sidebarLinks : marketingLinks;

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 8);

      // Show on scroll up, hide on scroll down (after passing 60px threshold)
      if (currentY < 60) {
        setVisible(true);
      } else if (currentY > lastScrollY.current + 4) {
        setVisible(false);
      } else if (currentY < lastScrollY.current - 4) {
        setVisible(true);
      }
      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "glass-header"
          : "bg-background/80 backdrop-blur border-b border-transparent",
        // Slide the whole navbar up/down
        visible ? "translate-y-0" : "-translate-y-full"
      )}
      style={{ transition: "transform 0.35s cubic-bezier(0.16,1,0.3,1), background 0.3s" }}
    >
      {/* ── Row 1: Logo + right-side actions ── */}
      <Container as="div" className="flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl transition-transform duration-300 group-hover:scale-105">
            <Image
              src="/logo.png"
              alt="QuizAI logo"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <span className="font-heading text-xl font-semibold tracking-tight text-foreground">
            QuizAI
          </span>
        </Link>

        {/* Right cluster */}
        <div className="flex items-center gap-3">
          {/* Desktop glassmorphism pill */}
          {!isPlatform && (
            <div
              className="hidden lg:flex items-center gap-1 px-2 py-1.5 rounded-full"
              style={{
                background: "color-mix(in oklch, var(--card) 55%, transparent)",
                backdropFilter: "blur(20px) saturate(150%)",
                WebkitBackdropFilter: "blur(20px) saturate(150%)",
                border: "1px solid color-mix(in oklch, var(--border) 40%, transparent)",
                boxShadow: "0 4px 24px -4px rgba(0,0,0,0.15), inset 0 1px 0 0 color-mix(in oklch, var(--foreground) 4%, transparent)",
              }}
            >
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative px-3.5 py-1.5 text-[13px] font-medium rounded-full transition-all duration-200",
                      isActive
                        ? "text-foreground bg-muted/60"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          )}

          <ThemeToggle className="h-9 w-9" />

          {/* Desktop Login button */}
          {!user && (
            <Link href="/login" className="hidden sm:block ml-2">
              <Button className="h-9 rounded-xl px-5 text-sm font-semibold shadow-lg shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-primary/30">
                Login / Sign Up
              </Button>
            </Link>
          )}

          {/* Mobile hamburger — still available for platform pages */}
          {isPlatform && (
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-xl border border-border/40 transition-colors hover:bg-muted/40 lg:hidden"
                  aria-label="Toggle menu"
                >
                  <Menu className="h-5 w-5 text-muted-foreground" />
                </Button>
              } />
              <SheetContent
                side="right"
                className="glass-surface w-full overflow-hidden border-l border-border/40 p-0 sm:w-[400px]"
              >
                <div className="flex flex-col h-full">
                  <div className="p-8 border-b border-border/40">
                    <SheetTitle className="font-heading text-3xl font-semibold tracking-tight text-foreground">
                      Navigation
                    </SheetTitle>
                    <SheetDescription className="mt-1 text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
                      Move through QuizAI
                    </SheetDescription>
                  </div>

                  <div className="flex-1 p-6 space-y-2 overflow-y-auto">
                    <div className="px-6 mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80">
                        Overview
                      </span>
                    </div>
                    {links.map((link) => {
                      const isActive = pathname === link.href;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "group flex items-center justify-between rounded-xl p-4 transition-colors duration-200",
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                          )}
                        >
                          <div className="flex items-center gap-5">
                            {('icon' in link) && (
                              <div className={cn(
                                "flex h-11 w-11 items-center justify-center rounded-xl transition-colors duration-200",
                                isActive ? "bg-primary/10" : "bg-primary/5 group-hover:bg-primary/10"
                              )}>
                                {/* @ts-expect-error - Runtime check with 'icon' in link ensures it's safe */}
                                <link.icon className="h-6 w-6" />
                              </div>
                            )}
                            <span className="font-heading text-2xl font-semibold tracking-tight">
                              {link.label}
                            </span>
                          </div>
                          <ArrowRight className={cn(
                            "h-5 w-5 transition-transform duration-200",
                            isActive ? "translate-x-0" : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                          )} />
                        </Link>
                      );
                    })}
                  </div>

                  <div className="space-y-3 border-t border-border/40 bg-muted/20 p-8">
                    {!user ? (
                      <Link href="/login" onClick={() => setMobileOpen(false)}>
                        <Button className="group h-12 w-full rounded-xl text-base font-medium">
                          Get Started
                          <Zap className="ml-2 h-4 w-4 fill-current transition-transform group-hover:scale-110" />
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        onClick={() => { logout(); setMobileOpen(false); }}
                        variant="destructive"
                        className="w-full h-12 text-base font-medium rounded-xl group"
                      >
                        Terminate Session
                        <LogOut className="ml-2 h-4 w-4 transition-transform group-hover:scale-110" />
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </Container>

      {/* ── Row 2: Mobile nav links (marketing pages only, below logo row) ── */}
      {!isPlatform && (
        <div
          className="lg:hidden border-t border-border/30"
          style={{
            background: "color-mix(in oklch, var(--card) 60%, transparent)",
            backdropFilter: "blur(20px)",
          }}
        >
          <Container as="div" className="flex items-center justify-between gap-1 py-1.5">
            <div className="flex items-center gap-0.5">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "px-2.5 py-1 text-[11px] font-medium rounded-full transition-all duration-200",
                      isActive
                        ? "text-foreground bg-muted/60"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Login button in mobile row */}
            {!user && (
              <Link href="/login" className="shrink-0">
                <Button className="h-7 rounded-lg px-3 text-[11px] font-semibold shadow-md shadow-primary/20">
                  Login / Sign Up
                </Button>
              </Link>
            )}
          </Container>
        </div>
      )}
    </nav>
  );
}
