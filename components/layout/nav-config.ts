import {
  LayoutDashboard,
  BookOpen,
  Trophy,
  User,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface PlatformNavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

/**
 * Canonical platform navigation — shared by the desktop floating pill
 * (top-nav) and the mobile floating bottom bar (bottom-nav).
 */
export const platformNavLinks: PlatformNavLink[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/quiz", label: "Quizzes", icon: BookOpen },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

/** Active-state matcher shared across nav surfaces. */
export function isNavActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}
