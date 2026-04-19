import { DailyQuizModel } from "../models/DailyQuiz.js";
import { UserModel } from "../models/User.js";
import { generateQuestions } from "./ai.service.js";
import { logger } from "../index.js";

export const CATEGORIES = [
  {
    id: "current-affairs",
    name: "Current Affairs",
    prompt: "mostly focus on current events from today and yesterday, world news, and politics.",
    stream: "General",
    topics: ["Current Events", "World News", "Politics"],
    subject: "Current Affairs",
  },
  {
    id: "tech",
    name: "Tech",
    prompt: "focus on recent technology trends, software engineering, AI, and big tech news.",
    stream: "Technology",
    topics: ["Software Engineering", "Artificial Intelligence", "Tech Industry"],
    subject: "Tech",
  },
  {
    id: "maths",
    name: "Maths",
    prompt: "quantitative aptitude, basic arithmetic, algebra, and logical math problems.",
    stream: "General",
    topics: ["Arithmetic", "Algebra", "Quantitative Aptitude"],
    subject: "Maths",
  },
  {
    id: "aptitude",
    name: "Aptitude",
    prompt: "logical reasoning, analytical thinking, and verbal aptitude.",
    stream: "General",
    topics: ["Logical Reasoning", "Analytical Thinking", "Verbal Aptitude"],
    subject: "Aptitude",
  },
];

export class DailyQuizService {
  /**
   * Generates new daily quizzes for all categories.
   * Runs at midnight.
   */
  static async refreshDailyQuizzes() {
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0]; // YYYY-MM-DD
    const expiresAt = new Date(today);
    expiresAt.setHours(23, 59, 59, 999); // Expires at end of today

    console.log(`[daily-quiz] Starting daily refresh for ${dateStr}`);

    for (const cat of CATEGORIES) {
      try {
        // Generate 10 questions for this category
        const questions = await generateQuestions({
          stream: cat.stream,
          topics: cat.topics,
          subject: cat.subject,
          difficulty: 3, // Balanced difficulty for daily quests
          count: 10,
        });

        // Map to embedded format
        const embeddedQuestions = questions.map(q => ({
          question: q.question,
          options: q.options,
          answer: q.answer,
          topic: q.topic,
          concept: q.concept,
        }));

        await DailyQuizModel.findOneAndUpdate(
          { date: dateStr, category: cat.name },
          {
            category: cat.name,
            title: `Daily ${cat.name}`,
            description: `Test your skills in ${cat.name} with today's fresh challenge.`,
            questions: embeddedQuestions,
            date: dateStr,
            expiresAt: expiresAt,
          },
          { upsert: true, new: true }
        );

        console.log(`[daily-quiz] Refreshed category: ${cat.name}`);
      } catch (error) {
        console.error(`[daily-quiz] Failed to refresh ${cat.name}:`, error);
      }
    }
  }

  /**
   * Updates the user's streak when they complete a daily quiz.
   */
  static async updateUserStreak(userId: string) {
    const user = await UserModel.findOne({ userId });
    if (!user) return;

    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    // If already active today, no change to streak
    if (user.lastActiveDate === today) {
      return { currentStreak: user.currentStreak, bestStreak: user.bestStreak };
    }

    let newStreak = 1;
    if (user.lastActiveDate === yesterday) {
      newStreak = (user.currentStreak || 0) + 1;
    }

    const bestStreak = Math.max(user.bestStreak || 0, newStreak);

    await UserModel.updateOne(
      { userId },
      {
        $set: {
          currentStreak: newStreak,
          bestStreak: bestStreak,
          lastActiveDate: today,
        },
      }
    );

    return { currentStreak: newStreak, bestStreak };
  }

  static async getTodayQuizzes() {
    const today = new Date().toISOString().split("T")[0];
    return DailyQuizModel.find({ date: today }).select("-questions.answer");
  }

  static async getDailyQuizById(id: string) {
    return DailyQuizModel.findById(id);
  }
}
