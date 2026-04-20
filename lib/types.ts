// ──────────────────────────────────────────────
// QuizAI — Core TypeScript types
// ──────────────────────────────────────────────

export type Difficulty = "easy" | "medium" | "hard";

export interface Option {
  id: string;
  label: string; // A, B, C, D
  text: string;
}

export interface Question {
  id: string;
  text: string;
  options: Option[];
  correctOptionId: string;
  explanation: string;
  topic: string; // The specific sub-domain
  concept?: string; // The broad category mapping back to topic
  difficulty?: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  questionCount: number;
  timePerQuestion: number; // seconds
  questions: Question[];
  imageUrl?: string;
}

export interface DailyQuiz {
  id: string;
  date: string;
  category: string;
  questions: Question[];
  questionCount: number;
  timePerQuestion: number;
  expiresAt: string;
  theme?: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  category: string;
  difficulty: Difficulty;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedAnswers: number;
  timeTaken: number; // seconds
  date: string;
  answers: AnswerRecord[];
  weakTopics: string[];
}

export interface AnswerRecord {
  questionId: string;
  questionText: string;
  selectedOptionId: string | null;
  correctOptionId: string;
  isCorrect: boolean;
  topic: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  memberSince: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
}

export interface UserStats {
  totalQuizzes: number;
  averageScore: number;
  currentStreak: number;
  bestStreak: number;
  rank: number;
  totalCorrect: number;
  totalQuestions: number;
  categoryPerformance: CategoryPerformance[];
  weeklyScores: WeeklyScore[];
}

export interface CategoryPerformance {
  category: string;
  score: number;
  total: number;
  percentage: number;
}

export interface WeeklyScore {
  day: string;
  score: number;
}

export type QuizState = "idle" | "loading" | "playing" | "reviewing" | "completed";

export interface QuizPlayState {
  state: QuizState;
  currentQuestionIndex: number;
  selectedAnswers: Map<string, string>;
  showFeedback: boolean;
  isCorrect: boolean | null;
  score: number;
  timeRemaining: number;
}
