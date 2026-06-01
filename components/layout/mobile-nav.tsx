"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Menu, LogOut } from "lucide-react";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger, 
  SheetTitle,
  SheetHeader
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
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
            className="h-8 w-8 text-muted-foreground hover:text-foreground lg:hidden"
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-4 w-4" aria-hidden="true" />
          </Button>
        }
      />
      <SheetContent side="right" className="w-[min(20rem,100vw-3rem)] p-0 border-l border-border bg-sidebar flex flex-col">
        <SheetHeader className="px-4 h-14 border-b border-border flex flex-row items-center space-y-0">
          <SheetTitle>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md overflow-hidden flex items-center justify-center">
                <Image src="/logo.png" alt="QuizAI Logo" width={24} height={24} className="object-contain" />
              </div>
              <span className="text-sm font-semibold text-sidebar-foreground">QuizAI</span>
            </div>
          </SheetTitle>
        </SheetHeader>

        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-2.5 rounded-md text-sm transition-colors duration-150",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "opacity-60")} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-2 space-y-0.5">
          <div className="flex items-center gap-2 px-2.5 py-1.5">
            <ThemeToggle />
            <span className="text-sm text-sidebar-foreground/60">Theme</span>
          </div>
          <Button
            variant="ghost"
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="w-full flex justify-start items-center gap-2.5 px-2.5 py-2.5 text-sm text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors duration-150 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
