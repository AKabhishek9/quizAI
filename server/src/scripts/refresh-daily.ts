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
  if (!uri || uri.includes("<user>") || uri.includes("your_gemini_api_key")) {
    console.error("❌ ERROR: Your server/.env file contains placeholder values.");
    console.error("Please update MONGODB_URI and GEMINI_API_KEY with real credentials.");
    process.exit(1);
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
