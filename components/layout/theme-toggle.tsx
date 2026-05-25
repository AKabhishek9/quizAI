"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Render a placeholder with identical dimensions until mounted
  // to avoid hydration mismatch (server doesn't know the resolved theme)
  if (!mounted) {
    return (
      <button
        className={cn(
          "flex items-center justify-center rounded-full text-muted-foreground transition-colors duration-200 cursor-pointer",
          className
        )}
        aria-label="Toggle theme"
        title="Toggle theme"
      >
        <Sun className="h-4 w-4 opacity-0" aria-hidden="true" />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-200 cursor-pointer",
        className
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Moon className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Sun className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
