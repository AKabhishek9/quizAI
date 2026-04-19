"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  Trophy,
  User,
  Settings,
  ChevronLeft,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const sidebarLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/quiz", label: "Quizzes", icon: BookOpen },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/profile", label: "Profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col border-r border-border bg-sidebar transition-[width] duration-200 ease-in-out",
        collapsed ? "w-[60px]" : "w-[220px]"
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 px-4 border-b border-border">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary">
          <Zap className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="text-[15px] font-semibold tracking-tight overflow-hidden whitespace-nowrap">
            QuizAI
          </span>
        )}
      </div>

      {/* Nav */}
      <nav
        className="flex-1 p-2 space-y-0.5"
        role="navigation"
        aria-label="Sidebar"
      >
        {sidebarLinks.map((link) => {
          const isActive =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative flex items-center gap-2.5 px-2.5 py-2 text-[13px] font-medium rounded-md transition-colors duration-150 cursor-pointer",
                isActive
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && (
                <span className="truncate">{link.label}</span>
              )}
              {isActive && (
                <motion.span
                  layoutId="sidebar-pill"
                  className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-full bg-primary"
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 28,
                  }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-2 space-y-0.5 border-t border-border">
        <Link
          href="/profile"
          className="flex items-center gap-2.5 px-2.5 py-2 text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 rounded-md transition-colors cursor-pointer"
        >
          <Settings className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="truncate">Settings</span>}
        </Link>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-start gap-2.5 px-2.5 h-8 text-[13px] font-medium text-muted-foreground cursor-pointer"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 shrink-0 transition-transform duration-200",
              collapsed && "rotate-180"
            )}
          />
          {!collapsed && <span className="truncate">Collapse</span>}
        </Button>
      </div>
    </aside>
  );
}
