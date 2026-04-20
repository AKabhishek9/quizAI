"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { ThemeToggle } from "./theme-toggle";
import { 
  LayoutDashboard, 
  BookOpen, 
  Trophy, 
  ClipboardCheck, 
  User, 
  LogOut, 
  ChevronLeft,
  Sparkles
} from "lucide-react";

export const sidebarLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/quiz", label: "Quizzes", icon: BookOpen },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/profile", label: "Profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-screen fixed left-0 top-0 border-r border-border bg-sidebar transition-all duration-300 z-50 overflow-hidden",
        collapsed ? "w-[56px]" : "w-[220px]"
      )}
    >
      {/* Brand */}
      <div className={cn(
        "flex h-14 items-center border-b border-border shrink-0",
        collapsed ? "justify-center px-0" : "gap-2.5 px-4"
      )}>
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary">
          <Sparkles className="h-4 w-4 text-primary-foreground fill-current" />
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
              className={cn(
                "group flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors duration-150",
                collapsed && "justify-center",
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

      {/* Bottom Actions */}
      <div className={cn(
        "border-t border-border py-2 px-2 space-y-0.5",
        collapsed && "items-center"
      )}>
        <div className={cn("flex items-center", collapsed ? "justify-center py-1" : "px-0.5 py-1")}>
          <ThemeToggle />
        </div>

        <button
          onClick={() => logout()}
          title={collapsed ? "Logout" : undefined}
          className={cn(
            "w-full flex items-center gap-2.5 px-2.5 py-2 text-sm text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors duration-150 cursor-pointer",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "w-full flex items-center gap-2.5 px-2.5 py-2 text-sm text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-colors duration-150 cursor-pointer",
            collapsed && "justify-center"
          )}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft className={cn(
            "h-4 w-4 shrink-0 transition-transform duration-300",
            collapsed && "rotate-180"
          )} />
          {!collapsed && <span className="text-xs">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
