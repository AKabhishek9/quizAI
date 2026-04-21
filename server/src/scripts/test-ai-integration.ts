/**
 * OpenRouter AI Service Integration Test
 *
 * Run: npx tsx src/scripts/test-ai-integration.ts
 */

import "dotenv/config"; // Ensure this loads first before any static imports

import { generateQuestions } from "../services/ai.service.js";
import { connectDB } from "../config/db.js";

const TEST_CONFIG = {
  stream: "Technology",
  subject: "Computer Science",
  topics: ["Arrays", "Linked Lists", "Trees"],
  difficulty: 2,
  count: 5,
};

async function runTests() {
  console.log("🧪 Starting OpenRouter AI Integration Tests\n");

  // Test 0: DB Connection
  // try {
  //   console.log("Test 0: 🔗 Connecting to MongoDB...");
  //   await connectDB();
  //   console.log("   ✓ Database connected\n");
  // } catch (err) {
  //   console.warn("   ⚠️ Database connection failed.\n");
  // }

  // Test 1: Environment Check
  console.log("Test 1: ✓ Environment Variable Check");
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error("❌ OPENROUTER_API_KEY not found in .env");
    process.exit(1);
  }
  console.log(`   ✓ Found API Key: ${apiKey.slice(0, 8)}...\n`);

  const model = process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-8b-instruct:free";
  console.log(`   ✓ Model: ${model}\n`);

  // Test 2: AI Generation
  console.log("Test 2: 🚀 Testing AI Generation");
  try {
    const start = Date.now();
    const questions = await generateQuestions({ ...TEST_CONFIG, skipInsert: true });
    console.log(`   ✓ Success! Received ${questions.length} questions in ${Date.now() - start}ms\n`);
    if (questions.length > 0) {
      console.log(`   Sample Q: ${questions[0].question.slice(0, 80)}...`);
    }
  } catch (err) {
    console.error(`   ❌ Generation failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  console.log("\n✅ Integration tests complete!");
  process.exit(0);
}

runTests();
