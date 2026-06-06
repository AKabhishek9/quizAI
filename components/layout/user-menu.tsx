"use client";

import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/components/providers/auth-provider";

/**
 * UserMenu — avatar trigger + glass profile dropdown. Houses the Logout action
 * that previously lived in the sidebar (no new business logic; reuses
 * useAuth().logout). Used in both the desktop pill and mobile top bar.
 */
export function UserMenu() {
  const { user, logout } = useAuth();

  const displayName = user?.displayName ?? user?.email ?? "Account";
  const initial = displayName.trim().charAt(0).toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label="Open account menu"
            className="rounded-full outline-none ring-offset-2 ring-offset-background transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
          >
            <Avatar className="size-8">
              {user?.photoURL && (
                <AvatarImage src={user.photoURL} alt={displayName} />
              )}
              <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
                {initial}
              </AvatarFallback>
            </Avatar>
          </button>
        }
      />
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="glass-nav w-56 rounded-xl border-0 p-1.5"
      >
        <div className="flex items-center gap-2.5 px-2 py-2">
          <Avatar className="size-9">
            {user?.photoURL && (
              <AvatarImage src={user.photoURL} alt={displayName} />
            )}
            <AvatarFallback className="bg-primary/15 text-primary text-sm font-semibold">
              {initial}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground leading-tight">
              {user?.displayName ?? "QuizAI Learner"}
            </p>
            {user?.email && (
              <p className="truncate text-xs text-muted-foreground mt-0.5">
                {user.email}
              </p>
            )}
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          onClick={() => logout()}
          className="cursor-pointer rounded-lg py-2"
        >
          <LogOut className="size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
