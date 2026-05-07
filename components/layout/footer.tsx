import Link from "next/link";
import { Terminal } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-12 border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
            <Terminal className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-foreground">QuizAI</span>
        </div>
        
        <div className="flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <Link href="/quiz" className="hover:text-primary transition-colors">Quizzes</Link>
          <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
        </div>
        
        <p className="text-xs text-muted-foreground font-medium tracking-tight">
          &copy; {new Date().getFullYear()} QuizAI. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
