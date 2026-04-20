"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Sparkles, LogOut, X } from "lucide-react";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger, 
  SheetTitle,
  SheetHeader
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { sidebarLinks } from "./sidebar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="p-2 text-muted-foreground hover:text-foreground lg:hidden"
            aria-label="Toggle navigation menu"
          />
        }
      >
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px] p-0 border-l border-border/10 bg-sidebar flex flex-col">
        <SheetHeader className="p-6 border-b border-border/10">
          <SheetTitle>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary-foreground fill-current" />
              </div>
              <span className="text-sm font-black tracking-tighter uppercase italic text-sidebar-foreground">QuizAI</span>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
                  isActive 
                    ? "bg-primary/10 text-primary shadow-glow-primary/5" 
                    : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "opacity-60")} />
                <span className="text-sm font-bold tracking-tight">{link.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="p-6 border-t border-border/10 bg-sidebar/50 backdrop-blur-sm space-y-2">
           <button
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-destructive hover:bg-destructive/10 rounded-xl transition-all duration-300 font-bold text-sm"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
