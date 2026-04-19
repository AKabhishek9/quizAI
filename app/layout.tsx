import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import {  } from "@tanstack/react-query";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "QuizAI — Intelligent Quiz Platform",
    template: "%s | QuizAI",
  },
  description:
    "Master any topic with AI-powered quizzes. Track your progress, identify weak areas, and level up your knowledge.",
  keywords: ["quiz", "learning", "AI", "education", "practice"],
  openGraph: {
    title: "QuizAI — Intelligent Quiz Platform",
    description:
      "Master any topic with AI-powered quizzes. Track your progress and level up your knowledge.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
