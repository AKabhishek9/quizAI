import Link from "next/link";

export function Footer() {
  return (
    <footer className="py-12 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>terminal</span>
          </div>
          <span className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">QuizAI</span>
        </div>
        
        <div className="flex items-center gap-8 text-sm font-medium text-neutral-500 dark:text-neutral-400">
          <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Home</Link>
          <Link href="/quiz" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Quizzes</Link>
          <Link href="/dashboard" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Dashboard</Link>
        </div>
        
        <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium tracking-tight">
          &copy; {new Date().getFullYear()} QuizAI. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
