import Link from "next/link";

export function Footer() {
  return (
    <footer className="py-12 border-t border-outline-variant/15">
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
            <span className="material-symbols-outlined text-primary-foreground text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>terminal</span>
          </div>
          <span className="text-xl font-black tracking-tighter text-foreground font-headline">QuizAI</span>
        </div>
        
        <div className="flex items-center gap-8 text-sm font-medium text-foreground/60 font-headline">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <Link href="/quiz" className="hover:text-primary transition-colors">Quizzes</Link>
          <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
        </div>
        
        <p className="text-xs text-foreground/50 font-medium tracking-tight">
          &copy; {new Date().getFullYear()} QuizAI. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
