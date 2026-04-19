"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const sidebarLinks = [
  { href: "/dashboard", label: "Dashboard", icon: "grid_view" },
  { href: "/quiz", label: "Quizzes", icon: "book_4" },
  { href: "/leaderboard", label: "Leaderboard", icon: "military_tech" },
  { href: "/profile", label: "Profile", icon: "person" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col border-r border-border bg-card transition-[width] duration-300 ease-[0.25, 0.1, 0.25, 1] relative z-20",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      {/* Brand Logo */}
      <div className="flex h-16 items-center gap-3 px-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary shadow-glow-primary">
          <span className="material-symbols-outlined text-[20px] text-primary-foreground">bolt</span>
        </div>
        {!collapsed && (
          <span className="text-[16px] font-black tracking-tighter text-foreground">
            QuizAI.
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {sidebarLinks.map((link) => {
          const isActive = pathname.startsWith(link.href);
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(70,72,212,0.1)]" 
                  : "text-foreground/70 hover:text-foreground hover:bg-muted"
              )}
            >
              <span className={cn(
                "material-symbols-outlined text-[22px] transition-transform duration-200 group-hover:scale-110",
                isActive ? "fill-1" : ""
              )}>
                {link.icon}
              </span>
              
              {!collapsed && (
                <span className="text-[13px] font-bold tracking-tight truncate">
                  {link.label}
                </span>
              )}

              {isActive && (
                <motion.div
                  layoutId="sidebar-active-glow"
                  className="absolute inset-0 rounded-xl bg-primary/5 shadow-glow-primary -z-10"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-border space-y-1 bg-card">
        <Link
          href="/profile"
          className="flex items-center gap-3 px-3 py-2.5 text-foreground/70 hover:text-foreground hover:bg-muted rounded-xl transition-all"
        >
          <span className="material-symbols-outlined text-[22px]">settings</span>
          {!collapsed && <span className="text-[13px] font-bold tracking-tight">Settings</span>}
        </Link>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-foreground/50 hover:text-foreground hover:bg-muted rounded-xl transition-all cursor-pointer"
        >
          <span className={cn(
            "material-symbols-outlined text-[22px] transition-transform duration-300",
            collapsed && "rotate-180"
          )}>
            first_page
          </span>
          {!collapsed && <span className="text-[13px] font-bold tracking-tight">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
