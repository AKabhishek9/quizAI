import type { Request, Response, NextFunction } from "express";
import { UserModel } from "../models/User.js";
import { QuizAttemptModel } from "../models/QuizAttempt.js";

interface CategoryPerformance {
  category: string;
  score: number;
  total: number;
  percentage: number;
}

interface UserProfileResponse {
  name: string; // Fake name until Firebase user profile supports DB name extension
  level: number;
  xp: number;
  xpToNextLevel: number;
}

interface UserStatsResponse {
  totalQuizzes: number;
  averageScore: number;
  currentStreak: number;
  bestStreak: number;
  rank: number;
  totalQuestions: number;
  totalCorrect: number;
  weeklyScores: { day: string; score: number }[];
  categoryPerformance: CategoryPerformance[];
}

export const getUserDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.uid;

    const userName = req.user!.name || req.user!.email?.split("@")[0] || "Student";
    const userEmail = req.user!.email || "";

    const user = await UserModel.findOneAndUpdate(
      { userId },
      { 
        $set: { 
          name: userName,
          email: userEmail
        },
        $setOnInsert: { 
          userId,
          currentLevel: 1 
        } 
      },
      { upsert: true, new: true }
    );

    const attempts = await QuizAttemptModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .select("score totalQuestions stream createdAt")
      .lean();
    
    // 1. Compile User Profile
    const profile: UserProfileResponse = {
      name: user.name,
      level: user.currentLevel,
      xp: user.xp || 0,
      xpToNextLevel: user.currentLevel * 100,
    };

    // 2. Compile Category Performance from conceptStats (which represents true historic mastery)
    const categoryPerformance: CategoryPerformance[] = [];
    if (user.conceptStats) {
      Array.from(user.conceptStats.entries()).forEach(([concept, stats]) => {
        if (stats.attempted > 0) {
          categoryPerformance.push({
            category: concept,
            score: stats.correct,
            total: stats.attempted,
            percentage: Math.round((stats.correct / stats.attempted) * 100),
          });
        }
      });
    }
    // Sort so best are first, take top 6
    categoryPerformance.sort((a, b) => b.percentage - a.percentage);
    const topCategories = categoryPerformance.slice(0, 6);

    // 3. Compile weeklyScores from `attempts`
    // For simplicity, map last 7 attempts as line chart plots
    const shortAttempts = attempts.slice(0, 10).reverse();
    const weeklyScores = shortAttempts.map((v) => ({
      day: v.createdAt
        ? new Date(v.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : "N/A",
      score: v.score,
    }));

    // 4. Calculate globals
    let avg = 0;
    const totalScore = attempts.reduce((acc, curr) => acc + curr.score, 0);
    
    if (attempts.length > 0) {
      avg = Math.round(totalScore / attempts.length);
    }

    const totalCorrect = Array.from(user.conceptStats.values()).reduce((sum, stat) => sum + stat.correct, 0);

    // Calculate actual global rank dynamically
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const rankAggregation = await QuizAttemptModel.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: "$userId", userScore: { $sum: "$score" } } },
      { $match: { userScore: { $gt: totalScore } } },
      { $count: "higherRanked" }
    ]);
    const rank = rankAggregation.length > 0 ? rankAggregation[0].higherRanked + 1 : 1;

    const stats: UserStatsResponse = {
      totalQuizzes: attempts.length,
      averageScore: avg,
      currentStreak: user.currentStreak || 0,
      bestStreak: user.bestStreak || 0,
      rank: rank,
      totalQuestions: user.attemptedQuestions.length,
      totalCorrect,
      weeklyScores: weeklyScores.length ? weeklyScores : [{ day: "Start", score: 0 }],
      categoryPerformance: topCategories.length ? topCategories : [{ category: "No Data", score: 0, total: 0, percentage: 0 }],
    };

    // 5. history maps matching frontend QuizAttempt format
    const history = attempts.slice(0, 5).map((a) => ({
      id: a._id.toString(),
      quizTitle: a.stream,
      score: a.score,
      totalQuestions: a.totalQuestions,
      date: a.createdAt ? a.createdAt.toISOString() : new Date().toISOString(),
    }));

    res.json({
      success: true,
      data: {
        profile,
        stats,
        history,
      }
    });
  } catch (err) {
    next(err);
  }
};


export const getLeaderboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Pipeline: Filter to last 7 days (Weekly Score), group by userId, sum scores, count total, then join with User profiles
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const leaderboard = await QuizAttemptModel.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: "$userId",
          totalScore: { $sum: "$score" },
          totalQuizzes: { $sum: 1 },
          avgAccuracy: { $avg: "$score" }
        }
      },
      { $sort: { totalScore: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "userId",
          as: "profile"
        }
      },
      {
        $project: {
          userId: "$_id",
          totalScore: 1,
          totalQuizzes: 1,
          avgAccuracy: { $round: ["$avgAccuracy", 1] },
          name: { $ifNull: [{ $arrayElemAt: ["$profile.name", 0] }, "Scholar"] },
          level: { $ifNull: [{ $arrayElemAt: ["$profile.currentLevel", 0] }, 1] }
        }
      }
    ]);

    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    next(error);
  }
};

