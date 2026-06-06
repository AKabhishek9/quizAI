"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";
import { platformNavLinks, isNavActive } from "./nav-config";

function Brand() {
  return (
    <Link
      href="/dashboard"
      className="group flex items-center gap-2 shrink-0"
      aria-label="QuizAI home"
    >
      <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg">
        <Image
          src="/logo.png"
          alt=""
          width={32}
          height={32}
          className="object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </span>
      <span className="font-heading text-base font-semibold tracking-tight text-foreground">
        QuizAI
      </span>
    </Link>
  );
}

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* ── Desktop: floating centered pill ── */}
      <div className="relative mx-auto hidden h-20 max-w-[1600px] items-center px-6 lg:flex">
        <Brand />

        <nav
          aria-label="Primary"
          className="glass-nav absolute left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full p-1.5"
        >
          {platformNavLinks.map((link) => {
            const active = isNavActive(pathname, link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-150",
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="glass-nav ml-auto flex items-center gap-1 rounded-full p-1.5">
          <ThemeToggle className="h-8 w-8" />
          <UserMenu />
        </div>
      </div>

      {/* ── Mobile: slim top bar ── */}
      <div className="lg:hidden">
        <div className="glass-nav mx-3 mt-3 flex h-14 items-center justify-between rounded-2xl px-4">
          <Brand />
          <div className="flex items-center gap-1">
            <ThemeToggle className="h-8 w-8" />
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
