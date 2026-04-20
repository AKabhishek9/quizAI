import { QuestionModel } from "../models/Question.js";
import { DailyQuizModel } from "../models/DailyQuiz.js";
import { generateQuestions } from "./ai.service.js";

/**
 * Configuration for the Daily Quiz Categories.
 * IDs match the enum in DailyQuizModel.
 */
export const CATEGORIES = [
  {
    id: "current_affairs",
    name: "Current Affairs",
    prompt: "focus strictly on news from today and yesterday, world events, and politics.",
    stream: "General",
    topics: ["Current Events", "World News", "Politics"],
    subject: "Current Affairs",
    color: "emerald",
    theme: "emerald"
  },
  {
    id: "tech",
    name: "Tech",
    prompt: "focus on recent tech trends, engineering breakthroughs, and AI news.",
    stream: "Technology",
    topics: ["Software Engineering", "Artificial Intelligence", "Tech Industry"],
    subject: "Tech",
    color: "indigo",
    theme: "indigo"
  },
  {
    id: "maths",
    name: "Maths",
    prompt: "basic maths, arithmetic, and school level algebra.",
    stream: "General",
    topics: ["Arithmetic", "Algebra", "Quantitative Aptitude"],
    subject: "Maths",
    color: "rose",
    theme: "rose"
  },
  {
    id: "aptitude",
    name: "Aptitude",
    prompt: "logical reasoning and brain teasers.",
    stream: "General",
    topics: ["Logical Reasoning", "Analytical Thinking", "Verbal Aptitude"],
    subject: "Aptitude",
    color: "amber",
    theme: "amber"
  },
];

export class DailyQuizService {
  /**
   * Generates new daily quizzes for all categories.
   * Runs at midnight (0 0 * * *).
   * Implements "Delete & Replace" cycle.
   */
  static async refreshDailyQuizzes() {
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0]; // YYYY-MM-DD

    console.log(`[daily-quiz] Starting midnight refresh cycle for ${dateStr}...`);

    try {
      const newDailyQuizzes = [];

      // 1. Generate new content for each category
      for (const cat of CATEGORIES) {
        try {
          console.log(`[daily-quiz] Generating ${cat.name}...`);
          
          let questions;
          // As requested: 20% chance for a "Big Quest" (20 questions instead of 10)
          const isBigQuest = Math.random() < 0.2;
          const questionCount = isBigQuest ? 20 : 10;
          
          try {
            // Try AI generation first
            questions = await generateQuestions({
              stream: cat.stream,
              topics: cat.topics,
              subject: cat.subject,
              difficulty: 3, 
              count: questionCount,
              skipInsert: true // We handle insertion into DailyQuizModel ourselves
            });
          } catch (aiError) {
            console.warn(`[daily-quiz] AI failed for ${cat.name}, using library fallback:`, aiError instanceof Error ? aiError.message : aiError);
            
            // Fallback: Pull from existing library
            questions = await QuestionModel.aggregate([
              { $match: { subject: cat.subject } },
              { $sample: { size: questionCount } }
            ]);
            
            if (questions.length === 0) {
              // Last ditch: pull ANY 10-20 questions
              questions = await QuestionModel.aggregate([
                { $sample: { size: questionCount } }
              ]);
            }
          }

          if (questions && questions.length > 0) {
            newDailyQuizzes.push({
              category: cat.id,
              questions: questions,
              date: dateStr
            });
          }
        } catch (error) {
          console.error(`[daily-quiz] Critical failure generating ${cat.name}:`, error);
        }
      }

      // 2. SAFE ROTATION: Insert new first, then delete old (no zero-quiz window)
      if (newDailyQuizzes.length > 0) {
        console.log(`[daily-quiz] Inserting ${newDailyQuizzes.length} new categories, then purging old...`);
        
        // Insert new batch first so users always see content
        await DailyQuizModel.insertMany(newDailyQuizzes);
        
        // Now delete old quizzes (anything not from today)
        await DailyQuizModel.deleteMany({ date: { $ne: dateStr } });
        
        console.log(`[daily-quiz] Refresh cycle complete. Site is updated.`);
      } else {
        console.warn(`[daily-quiz] No quizzes were generated. Skipping rotation to protect existing content.`);
      }

    } catch (error) {
      console.error(`[daily-quiz] Major failure during refresh cycle:`, error);
    }
  }

  /**
   * Fetches the 4 daily quizzes for the unified dashboard.
   */
  static async getDailyQuizzes() {
    const quizzes = await DailyQuizModel.find({}).lean();
    
    // Map to a more useful format for the frontend
    const result: Record<string, any> = {};
    
    // Initialize with placeholders if empty (fallback for brand new deployments)
    CATEGORIES.forEach(cat => {
      const found = quizzes.find(q => q.category === cat.id);
      if (found) {
        result[cat.id] = {
          id: found._id,
          title: `Daily ${cat.name}`,
          description: `Fresh ${cat.name} challenges for today.`,
          questionCount: found.questions.length,
          theme: cat.theme,
          color: cat.color,
          questions: found.questions.map((q: any) => ({ ...q, answer: undefined })) // Hide answers
        };
      }
    });

    return result;
  }

  /**
   * Fetches a specific daily quiz by its category ID.
   */
  static async getDailyQuizByCategoryId(catId: string) {
    const quiz = await DailyQuizModel.findOne({ category: catId }).lean();
    if (!quiz) return null;

    const cat = CATEGORIES.find(c => c.id === catId);
    
    return {
      _id: quiz._id,
      category: cat?.name || quiz.category,
      categoryKey: catId,
      title: `Daily ${cat?.name || quiz.category}`,
      theme: cat?.theme || "indigo",
      questions: quiz.questions,
      timePerQuestion: 30
    };
  }

  /**
   * Helper for the controller to get answer key for grading.
   */
  static async getDailyQuizAnswers(catId: string) {
    const quiz = await DailyQuizModel.findOne({ category: catId }).select("questions");
    if (!quiz) return null;

    return quiz.questions.map((q: any) => ({
      _id: q._id,
      answer: q.answer,
      question: q.question
    }));
  }

  /**
   * Updates the user's daily streak and awards XP.
   */
  static async updateUserStreak(userId: string, xpAmount: number = 50) {
    const { UserModel } = await import("../models/User.js");
    const user = await UserModel.findOne({ userId });
    if (!user) return null;

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    // Award XP
    const xpGained = xpAmount; 
    const oldLevel = user.currentLevel;
    user.xp = (user.xp || 0) + xpGained;

    // Standard Leveling Logic: 100 XP per level (linear for simplicity)
    const newLevel = Math.floor(user.xp / 100) + 1;
    const didLevelUp = newLevel > oldLevel;
    user.currentLevel = newLevel;

    // Streak Logic (only once per day)
    let streakIncremented = false;
    if (user.lastActiveDate !== todayStr) {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      let newStreak = 1;
      if (user.lastActiveDate === yesterdayStr) {
        newStreak = (user.currentStreak || 0) + 1;
      }

      user.currentStreak = newStreak;
      if (newStreak > (user.bestStreak || 0)) {
        user.bestStreak = newStreak;
      }
      user.lastActiveDate = todayStr;
      streakIncremented = true;
    }

    await user.save();

    return {
      currentStreak: user.currentStreak,
      bestStreak: user.bestStreak,
      isNewStreak: streakIncremented,
      xpGained,
      totalXp: user.xp,
      currentLevel: user.currentLevel,
      didLevelUp
    };
  }
}
