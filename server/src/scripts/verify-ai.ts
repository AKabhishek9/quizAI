/**
 * AI Integration Verification Tool
 * 
 * Run: npm run test-ai
 */

import "dotenv/config";
import { generateQuestions } from "../services/ai.service.js";

async function verify() {
  const provider = (process.env.AI_PROVIDER || "groq").toLowerCase();
  console.log(`🧪 ${provider.toUpperCase()} AI Integration Check Starting...\n`);

  const apiKeyName = provider === "openrouter" ? "OPENROUTER_API_KEY" : "GROQ_API_KEY";
  const apiKey = process.env[apiKeyName];
  const model = process.env.AI_MODEL || (provider === "openrouter" ? "google/gemini-2.0-flash-lite-preview-001:free" : "llama-3.3-70b-versatile");

  if (!apiKey || apiKey.includes("your_key_here")) {
    console.error(`❌ ERROR: ${apiKeyName} is missing or using placeholder in .env`);
    const link = provider === "openrouter" ? "https://openrouter.ai/keys" : "https://console.groq.com/keys";
    console.log(`   Please get a key from: ${link}`);
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
