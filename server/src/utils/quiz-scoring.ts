export interface ConceptTally {
  correct: number;
  total: number;
}

export interface QuizGradeResult {
  correct: number;
  total: number;
  accuracy: number;
  conceptTally: Map<string, ConceptTally>;
}

export interface AnswerPayload {
  questionId: string;
  selectedOption: number;
}

export function gradeQuizAnswers(
  answers: AnswerPayload[],
  questionMap: Map<string, { answer: number; concept: string }>
): QuizGradeResult {
  let correct = 0;
  const conceptTally = new Map<string, ConceptTally>();

  for (const ans of answers) {
    const q = questionMap.get(ans.questionId);
    if (!q) continue;

    const isCorrect = q.answer === ans.selectedOption;
    if (isCorrect) correct++;

    const tally = conceptTally.get(q.concept) ?? { correct: 0, total: 0 };
    tally.total++;
    if (isCorrect) tally.correct++;
    conceptTally.set(q.concept, tally);
  }

  const total = answers.length;
  const accuracy = total > 0 ? correct / total : 0;

  return { correct, total, accuracy, conceptTally };
}

export function updateConceptStats(
  existingStats: Map<string, { attempted: number; correct: number; accuracy: number }>,
  conceptTally: Map<string, ConceptTally>
): void {
  for (const [concept, tally] of conceptTally) {
    const existing = existingStats.get(concept) ?? {
      attempted: 0,
      correct: 0,
      accuracy: 0,
    };

    const newAttempted = existing.attempted + tally.total;
    const newCorrect = existing.correct + tally.correct;
    const newAccuracy = newAttempted > 0 ? newCorrect / newAttempted : 0;

    existingStats.set(concept, {
      attempted: newAttempted,
      correct: newCorrect,
      accuracy: Math.round(newAccuracy * 1000) / 1000,
    });
  }
}

export function calculateLevelChange(accuracy: number, prevLevel: number): number {
  if (accuracy >= 0.8 && prevLevel < 5) return 1;
  if (accuracy < 0.4 && prevLevel > 1) return -1;
  return 0;
}

export function calculateXPAwarded(accuracy: number, isDaily: boolean = false): number {
  let xpAwarded = 50;
  if (accuracy >= 0.8) {
    xpAwarded += 50;
  }
  if (isDaily) {
    xpAwarded += 25;
  }
  return xpAwarded;
}
