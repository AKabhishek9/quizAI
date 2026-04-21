/**
 * Groq AI Integration Verification Tool
 * 
 * Run: npx tsx src/scripts/verify-groq.ts
 */

import "dotenv/config";
import { generateQuestions } from "../services/ai.service.js";

async function verify() {
  console.log("🧪 Groq AI Integration Check Starting...\n");

  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.AI_MODEL || "llama-3.3-70b-versatile";

  if (!apiKey || apiKey === "gsk_your_key_here") {
    console.error("❌ ERROR: GROQ_API_KEY is missing or using placeholder in .env");
    console.log("   Please get a key from: https://console.groq.com/keys");
    process.exit(1);
  }

  console.log(`📡 Configured Model: ${model}`);
  console.log(`🔑 API Key Found: ${apiKey.slice(0, 8)}...`);

  try {
    console.log("\n🚀 Sending test generation request...");
    const start = Date.now();
    
    const questions = await generateQuestions({
      stream: "Technical Verification",
      topics: ["System Security", "API Design"],
      difficulty: 1,
      count: 2,
      skipInsert: true // Don't pollute DB with test data
    });

    const elapsed = Date.now() - start;
    console.log(`✅ SUCCESS! Received ${questions.length} questions in ${elapsed}ms`);
    
    if (questions.length > 0) {
      console.log("\nSample Question:");
      console.log(`Q: ${questions[0].question}`);
      console.log(`A: Option ${questions[0].answer} (${questions[0].options[questions[0].answer]})`);
      console.log(`Topic: ${questions[0].topic} | Concept: ${questions[0].concept}`);
    }
  } catch (error) {
    console.error("\n❌ VERIFICATION FAILED");
    if (error instanceof Error) {
      console.error(`Error Details: ${error.message}`);
      if (error.message.includes("401")) {
        console.log("   Tip: Your API key appears invalid.");
      } else if (error.message.includes("429")) {
        console.log("   Tip: You have hit the rate limit.");
      }
    } else {
      console.error(String(error));
    }
  }

  process.exit(0);
}

verify();
