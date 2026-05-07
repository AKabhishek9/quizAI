import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your QuizAI profile, preferences, and view your achievements.",
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
