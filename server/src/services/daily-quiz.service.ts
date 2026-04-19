import { UserModel } from "../models/User.js";
import { QuestionModel } from "../models/Question.js";
import { generateQuestions } from "./ai.service.js";


export const CATEGORIES = [
  {
    id: "current-affairs",
    name: "Current Affairs",
    prompt: "focus strictly on news from today and yesterday, world events, and politics.",
    stream: "General",
    topics: ["Current Events", "World News", "Politics"],
    subject: "Current Affairs",
  },
  {
    id: "tech",
    name: "Tech",
    prompt: "focus on recent tech trends, engineering breakthroughs, and AI news.",
    stream: "Technology",
    topics: ["Software Engineering", "Artificial Intelligence", "Tech Industry"],
    subject: "Tech",
  },
  {
    id: "maths",
    name: "Maths",
    prompt: "basic maths, arithmetic, and school level algebra.",
    stream: "General",
    topics: ["Arithmetic", "Algebra", "Quantitative Aptitude"],
    subject: "Maths",
  },
  {
    id: "aptitude",
    name: "Aptitude",
    prompt: "logical reasoning and brain teasers.",
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

    console.log(`[daily-quiz] Starting fresh overwrite refresh for ${dateStr}`);

    try {
      // 1. Delete all existing daily questions (The Overwrite Cycle)
      const deleted = await QuestionModel.deleteMany({ isDaily: true });
      console.log(`[daily-quiz] Purged ${deleted.deletedCount} old daily questions.`);

      // 2. Generate new questions for each category
      for (const cat of CATEGORIES) {
        try {
          console.log(`[daily-quiz] Generating for ${cat.name}...`);
          
          // Higher volume for key categories (Current Affairs and Tech)
          const count = (cat.id === "current-affairs" || cat.id === "tech") ? 15 : 10;
          
          await generateQuestions({
            stream: cat.stream,
            topics: cat.topics,
            subject: cat.subject,
            difficulty: 3, 
            count: count,
            isDaily: true,
            expiresAt: expiresAt
          });

          console.log(`[daily-quiz] Successfully refreshed category: ${cat.name}`);
        } catch (error) {
          console.error(`[daily-quiz] Failed to generate for ${cat.name}:`, error);
        }
      }
    } catch (error) {
      console.error(`[daily-quiz] Major failure during refresh wipe:`, error);
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

  /**
   * Returns metadata for the categories that have active questions.
   */
  static async getTodayQuizzes() {
    // Return all categories - frontend will handle navigation
    return CATEGORIES.map(cat => ({
      _id: cat.id, // Use category ID as the 'quiz ID' for routing
      category: cat.name,
      title: `Daily ${cat.name}`,
      description: `Today's top fresh questions in ${cat.name}.`,
      questionCount: 10
    }));
  }

  /**
   * Fetches the 10 daily questions for a specific category ID.
   */
  static async getDailyQuizByCategoryId(catId: string) {
    const cat = CATEGORIES.find(c => c.id === catId);
    if (!cat) return null;

    const questions = await QuestionModel.find({ 
      isDaily: true, 
      subject: cat.subject 
    }).select("-answer"); // Security: hide answer until submission

    if (questions.length === 0) return null;

    return {
      _id: cat.id,
      category: cat.name,
      title: `Daily ${cat.name}`,
      questions: questions,
      timePerQuestion: 30
    };
  }

  /**
   * Helper for the controller to get answer key for grading.
   */
  static async getDailyQuizAnswers(catId: string) {
    const cat = CATEGORIES.find(c => c.id === catId);
    if (!cat) return null;

    return QuestionModel.find({ 
      isDaily: true, 
      subject: cat.subject 
    }).select("_id answer question");
  }
}

