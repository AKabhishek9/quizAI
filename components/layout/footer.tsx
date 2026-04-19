import Link from "next/link";
import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <div className="flex flex-col items-center gap-4 py-8 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
              <Zap className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="text-xs font-semibold tracking-tight">
              QuizAI
            </span>
          </div>

          <nav
            className="flex gap-5 text-xs text-muted-foreground"
            aria-label="Footer"
          >
            <Link
              href="/"
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              Home
            </Link>
            <Link
              href="/quiz"
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              Quizzes
            </Link>
            <Link
              href="/dashboard"
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              Dashboard
            </Link>
          </nav>

          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} QuizAI
          </p>
        </div>
      </div>
    </footer>
  );
}
