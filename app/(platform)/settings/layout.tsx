import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your QuizAI profile, appearance, and account settings.",
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
