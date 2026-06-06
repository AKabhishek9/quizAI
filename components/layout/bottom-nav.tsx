"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { platformNavLinks, isNavActive } from "./nav-config";
import { useNavVisibility } from "@/hooks/use-nav-visibility";

/**
 * BottomNav — mobile floating navigation bar. Thumb-friendly, fixed to the
 * bottom, glass surface. Hidden on lg+ where the top pill takes over.
 */
export function BottomNav() {
  const pathname = usePathname();
  const visible = useNavVisibility();

  return (
    <nav
      aria-label="Primary"
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ease-out will-change-transform motion-reduce:transition-none lg:hidden",
        visible ? "translate-y-0" : "translate-y-[130%] pointer-events-none"
      )}
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
