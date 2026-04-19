"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { 
  LayoutDashboard, 
  BookOpen, 
  Trophy, 
  ClipboardCheck, 
  User, 
  Settings, 
  HelpCircle, 
  LogOut, 
  ChevronLeft,
  Sparkles
} from "lucide-react";

const sidebarLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/quiz", label: "Quizzes", icon: BookOpen },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/result", label: "Results", icon: ClipboardCheck },
  { href: "/profile", label: "Profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-screen fixed left-0 top-0 border-r border-sidebar-border bg-sidebar transition-all duration-500 ease-[0.25, 0.1, 0.25, 1] z-50 overflow-hidden",
        collapsed ? "w-[80px]" : "w-[260px]"
      )}
    >
      {/* Brand Logo */}
      <div className="flex h-[80px] items-center gap-3 px-6 mb-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary shadow-glow-primary transition-transform duration-500 hover:scale-105">
          <Sparkles className="h-5 w-5 text-primary-foreground fill-current" />
        </div>
        {!collapsed && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <span className="text-[18px] font-black tracking-tighter text-sidebar-foreground leading-none">
              QuizAI
            </span>
            <span className="text-[9px] font-bold tracking-[0.15em] text-primary uppercase mt-1 opacity-80">
              Technical Atelier
            </span>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1.5 scrollbar-none overflow-y-auto">
        <div className="mb-4 px-2">
          {!collapsed && (
            <span className="text-[10px] font-bold tracking-[0.1em] text-sidebar-foreground/40 uppercase">
              Overview
            </span>
          )}
        </div>
        
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
          const Icon = link.icon;
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "group relative flex items-center gap-3.5 px-3 py-2.5 rounded-xl transition-all duration-300",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <Icon className={cn(
                "h-[20px] w-[20px] shrink-0 transition-all duration-300",
                isActive ? "text-primary scale-110" : "opacity-60 group-hover:opacity-100"
              )} />
              
              {!collapsed && (
                <span className={cn(
                  "text-[13px] font-bold tracking-tight transition-all duration-300",
                  isActive ? "translate-x-0.5" : "opacity-80"
                )}>
                  {link.label}
                </span>
              )}

              {isActive && (
                <motion.div
                  layoutId="sidebar-active-indicator"
                  className="absolute left-0 w-1 h-5 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-sidebar-border bg-sidebar/50 backdrop-blur-sm space-y-1.5">
        {!collapsed && (
          <div className="px-2 mb-2">
            <span className="text-[10px] font-bold tracking-[0.1em] text-sidebar-foreground/40 uppercase">
              Support & Account
            </span>
          </div>
        )}

        <button
          className="w-full flex items-center gap-3.5 px-3 py-2.5 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-xl transition-all duration-300 group cursor-pointer"
        >
          <HelpCircle className="h-[20px] w-[20px] shrink-0 opacity-60 group-hover:opacity-100" />
          {!collapsed && <span className="text-[13px] font-bold tracking-tight opacity-80">Help Center</span>}
        </button>

        <Link
          href="/profile"
          className="flex items-center gap-3.5 px-3 py-2.5 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-xl transition-all duration-300 group"
        >
          <Settings className="h-[20px] w-[20px] shrink-0 opacity-60 group-hover:opacity-100" />
          {!collapsed && <span className="text-[13px] font-bold tracking-tight opacity-80">Settings</span>}
        </Link>
        
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3.5 px-3 py-2.5 text-destructive hover:bg-destructive/10 rounded-xl transition-all duration-300 group cursor-pointer"
        >
          <LogOut className="h-[20px] w-[20px] shrink-0 opacity-70 group-hover:opacity-100" />
          {!collapsed && <span className="text-[13px] font-bold tracking-tight">Logout</span>}
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="mt-2 w-full flex items-center justify-center p-2 text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors cursor-pointer"
        >
          <ChevronLeft className={cn(
            "h-5 w-5 transition-transform duration-500",
            collapsed && "rotate-180"
          )} />
        </button>
      </div>
    </aside>
  );
}
