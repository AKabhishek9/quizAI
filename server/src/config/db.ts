import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI && !process.env.MONGODB_URI.includes("<user>") 
  ? process.env.MONGODB_URI 
  : "mongodb://127.0.0.1:27017/quizai";

export async function connectDB(): Promise<void> {
  try {
    console.log(`[db] Attempting connection to: ${MONGODB_URI.split("@").pop()}`);
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Don't hang forever
    });
    console.log(`[db] Connected to MongoDB`);
  } catch (err: any) {
    if (err.message.includes("ECONNREFUSED")) {
      console.error("❌ ERROR: MongoDB service is NOT running locally.");
      console.error("Please start MongoDB (Command: 'net start MongoDB' or via Services).");
    } else {
      console.error("[db] Connection failed:", err.message);
    }
    process.exit(1);
  }

  mongoose.connection.on("error", (err) => {
    console.error("[db] Runtime error:", err);
  });
}
