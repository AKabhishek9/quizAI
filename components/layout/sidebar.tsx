"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { StreakBadge } from "@/components/shared/streak-badge";
import { XpMiniBar } from "@/components/shared/xp-mini-bar";
import {
  LayoutDashboard,
  BookOpen,
  Trophy,
  User,
  Settings,
  LogOut,
  ChevronLeft,
} from "lucide-react";

export const sidebarLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/quiz", label: "Quizzes", icon: BookOpen },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ 
  collapsed, 
  onToggle 
}: { 
  collapsed: boolean; 
  onToggle: () => void; 
}) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-screen fixed left-0 top-0 transition-all duration-300 z-50 overflow-hidden glass-sidebar",
        collapsed ? "w-[56px]" : "w-[220px]"
      )}
    >
      {/* Brand */}
      <div className={cn(
        "flex h-14 items-center border-b border-border shrink-0",
        collapsed ? "justify-center px-0" : "gap-2.5 px-4"
      )}>
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md overflow-hidden">
          <Image src="/logo.png" alt="QuizAI Logo" width={28} height={28} className="object-contain" />
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold text-sidebar-foreground tracking-tight">
            QuizAI
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto scrollbar-none">
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
          const Icon = link.icon;
          
          return (
            <Link
              key={link.href}
              href={link.href}
              title={collapsed ? link.label : undefined}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors duration-150",
                collapsed && "justify-center",
                isActive && "border-l-2 border-primary",
                isActive && !collapsed && "pl-2",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <Icon className={cn(
                "h-4 w-4 shrink-0",
                isActive ? "text-primary" : "opacity-60 group-hover:opacity-100"
              )} />
              {!collapsed && (
                <span>{link.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Gamification — always visible */}
      <div className={cn("border-t border-border py-2.5", collapsed ? "px-2 flex justify-center" : "px-3 space-y-2")}>
        <StreakBadge collapsed={collapsed} />
        {!collapsed && <XpMiniBar />}
      </div>

      {/* Bottom Actions */}
      <div className={cn(
        "border-t border-border py-2 px-2 space-y-0.5",
        collapsed && "items-center"
      )}>
        <div className={cn("flex items-center", collapsed ? "justify-center py-1" : "px-0.5 py-1")}>
          <ThemeToggle />
        </div>

        <Button
          variant="ghost"
          onClick={() => logout()}
          title={collapsed ? "Logout" : undefined}
          className={cn(
            "w-full flex items-center justify-start gap-2.5 px-2.5 py-2 text-sm text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors duration-150 cursor-pointer",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </Button>

        <Button
          variant="ghost"
          onClick={() => onToggle()}
          className={cn(
            "w-full flex items-center justify-start gap-2.5 px-2.5 py-2 text-sm text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-colors duration-150 cursor-pointer",
            collapsed && "justify-center"
          )}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft className={cn(
            "h-4 w-4 shrink-0 transition-transform duration-300",
            collapsed && "rotate-180"
          )} />
          {!collapsed && <span>Collapse</span>}
        </Button>
      </div>
    </aside>
  );
}
