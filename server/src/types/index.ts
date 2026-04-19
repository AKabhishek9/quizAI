/* ─── Shared types ─── */

export interface QuestionDoc {
  _id: string;
  question: string;
  options: string[];
  answer: number; // index into options[]
  stream: string;
  subject: string;
  concept: string;
  topic: string;
  difficulty: number; // 1–5
}

export interface ConceptStat {
  attempted: number;
  correct: number;
  accuracy: number; // 0–1, computed
}

export interface UserDoc {
  userId: string;
  attemptedQuestions: string[]; // ObjectId refs, capped
  conceptStats: Map<string, ConceptStat>;
  currentLevel: number; // 1–5
  preferredStreams: string[];
}

export interface DynamicQuizRequest {
  userId: string;
  stream: string;
  topics: string[];
  difficulty?: number;
}

export interface SubmitPayload {
  userId: string;
  answers: {
    questionId: string;
    selectedOption: number; // index
  }[];
}

export interface QuizResponse {
  questions: {
    _id: string;
    question: string;
    options: string[];
    concept: string;
    topic: string;
    difficulty: number;
  }[];
}

export interface SubmitResponse {
  score: number;
  total: number;
  accuracy: number;
  levelChange: number; // -1, 0, or +1
  newLevel: number;
  attemptId: string;
  conceptBreakdown: {
    concept: string;
    correct: number;
    total: number;
  }[];
}
