"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { ThemeToggle } from "./theme-toggle";
import { Search, Bell, Sparkles, LogOut, User as UserIcon, Settings, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const tabs = [
  { label: "Explore", href: "/dashboard" },
  { label: "Community", href: "/leaderboard" },
  { label: "Documentation", href: "/docs" },
];

export function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-xl border-b border-border/40">
      <div className="flex h-16 items-center justify-between px-8">
        {/* Left: Navigation Tabs */}
        <div className="flex items-center gap-8">
          <nav className="flex items-center gap-1">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "px-4 py-1.5 text-[13px] font-black tracking-tighter rounded-full transition-all duration-300 uppercase italic",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-muted/40 border border-border/40 rounded-full text-muted-foreground transition-all hover:border-border/80 cursor-pointer group hover:bg-muted/60">
            <Search className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
            <span className="text-[11px] font-black tracking-widest uppercase opacity-60 group-hover:opacity-100">Synchronize Search</span>
            <kbd className="text-[9px] font-black px-2 py-0.5 rounded-md bg-background border border-border/60 text-muted-foreground/30">⌘K</kbd>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-all relative group">
              <Bell className="h-4.5 w-4.5 group-hover:scale-110 transition-transform" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-background animate-pulse" />
            </button>
            <ThemeToggle />
          </div>

          <div className="h-8 w-[1px] bg-border/10 mx-2" />

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 pl-1 group outline-none">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-[12px] font-black tracking-tighter text-foreground leading-none group-hover:text-primary transition-colors">
                  {user?.displayName || user?.email?.split("@")[0] || "Scholar"}
                </span>
                <span className="text-[9px] font-black tracking-[0.2em] text-primary uppercase mt-1 opacity-60">
                  Elite Scholar
                </span>
              </div>
              <div className="relative">
                <div className="h-10 w-10 rounded-2xl bg-primary/10 border-2 border-background shadow-soft ring-1 ring-primary/20 flex items-center justify-center overflow-hidden transition-all group-hover:scale-105 group-hover:ring-primary/40 group-hover:border-primary/10">
                  {user?.photoURL ? (
                    <Image src={user.photoURL} alt="User" width={40} height={40} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-primary text-[14px] font-black font-heading">
                      {(user?.displayName || user?.email || "A").substring(0, 1).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-background rounded-full flex items-center justify-center border border-border/40 shadow-soft">
                  <ChevronDown className="h-2 w-2 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-2 rounded-[24px] bg-card/95 border border-border/40 backdrop-blur-xl whisper-shadow" sideOffset={12}>
              <DropdownMenuLabel className="px-3 py-4">
                <div className="flex flex-col gap-1">
                  <p className="text-[13px] font-black tracking-tighter text-foreground leading-none">{user?.displayName || "Scholar Identity"}</p>
                  <p className="text-[11px] font-bold text-muted-foreground/60 truncate">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/10" />
              <DropdownMenuItem className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer hover:bg-muted/60 transition-colors focus:bg-primary/5 focus:text-primary group">
                <UserIcon className="h-4 w-4 text-muted-foreground group-focus:text-primary transition-colors" />
                <span className="text-[12px] font-black tracking-tight uppercase italic group-focus:not-italic">Scholarly Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer hover:bg-muted/60 transition-colors focus:bg-primary/5 focus:text-primary group">
                <Settings className="h-4 w-4 text-muted-foreground group-focus:text-primary transition-colors" />
                <span className="text-[12px] font-black tracking-tight uppercase italic group-focus:not-italic">System Parameters</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/10" />
              <DropdownMenuItem 
                onClick={() => logout()}
                className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer hover:bg-destructive/10 text-destructive focus:bg-destructive/10 focus:text-destructive group mt-1"
              >
                <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                <span className="text-[12px] font-black tracking-tight uppercase italic group-focus:not-italic">De-calculate Session</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
