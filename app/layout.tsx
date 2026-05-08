import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "QuizAI | Intelligent Quiz Platform",
    template: "%s | QuizAI",
  },
  description:
    "Master any topic with AI-powered quizzes. Track your progress, identify weak areas, and level up your knowledge.",
  keywords: ["quiz", "learning", "AI", "education", "practice"],
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "QuizAI | Intelligent Quiz Platform",
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
      className={`${inter.variable} ${manrope.variable} h-full antialiased`}
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
              <AuthProvider>{children}</AuthProvider>
            </TooltipProvider>
          </ThemeProvider>
        </QueryProvider>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
