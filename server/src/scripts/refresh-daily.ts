import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "../config/db.js";
import { DailyQuizService } from "../services/daily-quiz.service.js";
import mongoose from "mongoose";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../../server/.env") });

async function run() {
  const uri = process.env.MONGODB_URI;
  const aiKey = process.env.GEMINI_API_KEY;

  if (!uri || uri.includes("<user>")) {
    console.warn("⚠️  WARNING: MONGODB_URI is using a placeholder. Falling back to local (127.0.0.1)");
  }
  
  if (!aiKey || aiKey.includes("your_gemini_api_key")) {
    console.warn("⚠️  WARNING: GEMINI_API_KEY is missing. Real AI questions cannot be generated.");
  }

  console.log("🚀 Connecting to database...");
  await connectDB();
  
  console.log("🔄 Forcing daily quiz refresh (generating AI questions)...");
  try {
    await DailyQuizService.refreshDailyQuizzes();
    console.log("✅ Daily quizzes refreshed successfully!");
  } catch (error) {
    console.error("❌ Failed to refresh daily quizzes:", error);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Disconnected.");
    process.exit(0);
  }
}

run();
