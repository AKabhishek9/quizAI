"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
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
  { href: "/", label: "Home" },
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How It Works" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout, user } = useAuth();
  const isPlatform =
    pathname.startsWith("/dashboard") ||
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
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "glass-header"
          : "bg-background/80 backdrop-blur border-b border-transparent"
      )}
    >
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

        {/* Desktop Nav */}
        {!isPlatform && (
          <div className="hidden items-center gap-6 md:flex">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                    isActive && "text-foreground"
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
          <ThemeToggle className="h-9 w-9" />

          {!user && (
            <Link href="/login" className="hidden sm:block">
              <Button className="h-9 rounded-xl px-4 text-sm font-medium">
                Get Started
              </Button>
            </Link>
          )}

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
                  {isPlatform && (
                    <div className="px-6 mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80">
                        Overview
                      </span>
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
                      onClick={() => {
                        logout();
                        setMobileOpen(false);
                      }}
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
        </div>
      </Container>
    </nav>
  );
}
