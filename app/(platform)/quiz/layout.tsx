import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quizzes",
  description: "Explore and play AI-generated quizzes across multiple subjects.",
};

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
