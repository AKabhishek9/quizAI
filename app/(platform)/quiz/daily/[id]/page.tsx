"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, RotateCcw, Trophy, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuizOption } from "@/components/quiz/quiz-option";
import { QuizIdleState } from "@/components/quiz/quiz-idle-state";
import { QuizPlayingState } from "@/components/quiz/quiz-playing-state";
import { QuizCompletedState } from "@/components/quiz/quiz-completed-state";
import { LevelUpToast } from "@/components/shared/level-up-toast";
import { useQuiz } from "@/hooks/use-quiz";
import { useTimer } from "@/hooks/use-timer";
import { getDailyQuizById, submitDailyQuizSolution } from "@/lib/api-client";
import type { DailyQuiz } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function DailyQuizPlayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [quiz, setQuiz] = useState<DailyQuiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [streakUpdated, setStreakUpdated] = useState(false);
  const [retryNonce, setRetryNonce] = useState(0);
  const [refreshCountdown, setRefreshCountdown] = useState("");

  const {
    state,
    currentQuestionIndex,
    selectedAnswer,
    showFeedback,
    isCorrect,
    startQuiz,
    selectAnswer,
    submitAnswer,
    nextQuestion,
    getResults,
    answers,
  } = useQuiz(quiz as any); // Type cast for reuse

  const currentQuestion = quiz?.questions[currentQuestionIndex] ?? null;
  const totalTime = quiz?.timePerQuestion ?? 30;

  const {
    timeRemaining,
    isExpired: isTimerExpired,
    resetAndStart: resetAndStartTimer,
    pause: pauseTimer,
  } = useTimer(totalTime, () => {
    if (state === "playing" && !showFeedback) {
      submitAnswer();
    }
  });

  const [streakInfo, setStreakInfo] = useState<{ currentStreak: number; bestStreak: number } | null>(null);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const distance = midnight.getTime() - now.getTime();
      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      setRefreshCountdown(`${hours}h ${minutes}m`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setQuiz(null);
      try {
        const data = await getDailyQuizById(id);
        
        // Map backend schema to frontend typing for useQuiz hook
        const mappedQuiz = {
          ...data,
          title: `Daily ${data.category}`,
          questions: data.questions.map((q: any, idx: number) => ({
            id: q._id || `q-${idx}`,
            text: q.question,
            options: q.options.map((opt: string, optIdx: number) => ({
              id: optIdx.toString(),
              label: String.fromCharCode(65 + optIdx),
              text: opt
            })),
            correctOptionId: q.answer.toString(),
            explanation: q.explanation || `The correct answer is ${String.fromCharCode(65 + parseInt(q.answer))}.`,
            topic: q.topic || data.category
          })),
          questionCount: data.questions.length,
          timePerQuestion: data.timePerQuestion || 30,
          difficulty: "medium" as const,
          theme: data.theme || "indigo"
        };

        setQuiz(mappedQuiz as any);
      } catch (error) {
        console.error("Failed to load daily quiz:", error);
        toast.error("Failed to load daily quiz");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, retryNonce]);

  useEffect(() => {
    if (state === "playing" && !showFeedback) {
      resetAndStartTimer(totalTime);
    }
  }, [currentQuestionIndex, state, totalTime, resetAndStartTimer, showFeedback]);

  useEffect(() => {
    if (showFeedback) pauseTimer();
  }, [showFeedback, pauseTimer]);

  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelInfo, setLevelInfo] = useState({ newLevel: 1, xpGained: 0 });

  // Handle submission when quiz ends
  useEffect(() => {
    if (state === "completed" && !streakUpdated && quiz) {
      const formattedAnswers = Object.entries(answers).map(([qId, optId]) => ({
        questionId: qId,
        selectedOption: parseInt(optId as string, 10)
      }));

      const submit = async () => {
        setIsSubmitting(true);
        try {
          const response = await submitDailyQuizSolution(id, formattedAnswers);
          setStreakUpdated(true);
          setStreakInfo(response.streak);
          
          if (response.streak?.didLevelUp) {
            setLevelInfo({ 
              newLevel: response.streak.currentLevel, 
              xpGained: response.streak.xpGained 
            });
            setShowLevelUp(true);
          } else {
            toast.success(
              response.streak
                ? `Daily quest complete! Day ${response.streak.currentStreak} streak, +${response.streak.xpGained} XP`
                : "Daily quest complete!",
              {
                icon: <Flame className="h-4 w-4 text-warning" />,
              }
            );
          }
        } catch (error) {
          console.error("Streak update failed:", error);
        } finally {
          setIsSubmitting(false);
        }
      };
      submit();
    }
  }, [state, streakUpdated, quiz, id, answers]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="card-base max-w-md mx-auto text-center py-12 px-6 mt-12">
        <h2 className="font-heading text-base font-medium text-foreground">Quest not found</h2>
        <p className="text-xs text-muted-foreground mt-1">
          This daily quest has expired or doesn&apos;t exist.
        </p>
        {refreshCountdown && (
          <p className="text-xs text-muted-foreground mt-2">
            Next daily refresh in {refreshCountdown}.
          </p>
        )}
        <div className="mt-5 flex flex-col sm:flex-row justify-center gap-2">
          <Button
            onClick={() => setRetryNonce((value) => value + 1)}
            size="sm"
            className="cursor-pointer"
          >
            Retry
          </Button>
        <Button
          onClick={() => router.push("/quiz")}
          size="sm"
          variant="outline"
          className="cursor-pointer"
        >
          Back to library
        </Button>
        </div>
      </div>
    );
  }

  const themeColors = {
    emerald: "from-success/10 to-success/5 text-success border-success/20",
    indigo: "from-primary/10 to-primary/5 text-primary border-primary/20",
    amber: "from-warning/10 to-warning/5 text-warning border-warning/20",
    rose: "from-destructive/10 to-destructive/5 text-destructive border-destructive/20",
  };

  const currentTheme = themeColors[quiz.theme as keyof typeof themeColors] || themeColors.indigo;

  /* ── Idle ── */
  if (state === "idle") {
    return (
      <QuizIdleState
        isDaily={true}
        title={`Daily Quest`}
        description={`Complete this ${quiz.questions.length}-question challenge to maintain your daily streak and earn bonus XP.`}
        questionCount={quiz.questions.length}
        timePerQuestion={totalTime}
        themeClass={currentTheme}
        themeName={quiz.theme}
        xpReward={50}
        onStart={startQuiz}
        onBack={() => router.back()}
      />
    );
  }

  /* ── Completed ── */
  if (state === "completed") {
    const results = getResults();
    return (
      <QuizCompletedState
        isDaily={true}
        accuracy={results.score}
        correctCount={results.correctAnswers}
        questionCount={quiz.questions.length}
        xpAwarded={levelInfo.xpGained}
        newLevel={levelInfo.newLevel}
        showLevelToast={showLevelUp}
        setShowLevelToast={setShowLevelUp}
        streakInfo={streakInfo}
        themeClass={currentTheme}
        themeName={quiz.theme}
      />
    );
  }

  /* ── Playing ── */
  return (
    <QuizPlayingState
      isDaily={true}
      category={quiz.category}
      themeClass={currentTheme}
      themeName={quiz.theme}
      currentQuestionIndex={currentQuestionIndex}
      questionCount={quiz.questions.length}
      timeRemaining={timeRemaining}
      totalTime={totalTime}
      currentQuestion={currentQuestion}
      selectedAnswer={selectedAnswer}
      showFeedback={showFeedback}
      isCorrect={isCorrect}
      submitAnswer={submitAnswer}
      selectAnswer={selectAnswer}
      nextQuestion={nextQuestion}
      isSubmitting={isSubmitting}
      isTimerExpired={isTimerExpired}
    />
  );
}
