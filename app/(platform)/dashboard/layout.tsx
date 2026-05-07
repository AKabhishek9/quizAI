import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "View your learning progress and daily quests on QuizAI.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
