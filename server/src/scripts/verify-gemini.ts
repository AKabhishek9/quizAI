import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

async function testModel(genAI: GoogleGenerativeAI, modelName: string) {
  console.log(`\n--- Testing Model: ${modelName} ---`);
  const model = genAI.getGenerativeModel({ model: modelName });
  try {
    const result = await model.generateContent("Say hello world in one word.");
    console.log(`Success [${modelName}]:`, result.response.text());
  } catch (err: any) {
    console.error(`Error [${modelName}]:`, JSON.stringify(err, null, 2));
    if (err.errorDetails) {
      console.error(`Status: ${err.status}`);
      console.error(`Violations:`, JSON.stringify(err.errorDetails.find((d: any) => d.violations)?.violations, null, 2));
    }
  }
}

async function test() {
  const key = process.env.GOOGLE_AI_API_KEY?.trim();
  console.log("Using API Key:", key ? `${key.slice(0, 10)}...` : "NOT FOUND");
  
  if (!key) return;

  const genAI = new GoogleGenerativeAI(key);
  
  await testModel(genAI, "gemini-2.0-flash");
  await testModel(genAI, "gemini-1.5-flash");
  await testModel(genAI, "gemini-1.5-flash-latest");
}

test();



