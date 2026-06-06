"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { platformNavLinks, isNavActive } from "./nav-config";

/**
 * BottomNav — mobile floating navigation bar. Thumb-friendly, fixed to the
 * bottom, glass surface. Hidden on lg+ where the top pill takes over.
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 lg:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div className="glass-nav mx-3 flex items-center justify-between gap-0.5 rounded-2xl p-1.5">
        {platformNavLinks.map((link) => {
          const active = isNavActive(pathname, link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              aria-label={link.label}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-medium transition-colors duration-150",
                active
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="leading-none">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
