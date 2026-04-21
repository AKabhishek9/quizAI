import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI && !process.env.MONGODB_URI.includes("<user>") 
  ? process.env.MONGODB_URI 
  : "mongodb://127.0.0.1:27017/quizai";

const isAtlas = MONGODB_URI.includes("mongodb+srv");

export async function connectDB(): Promise<void> {
  try {
    console.log(`[db] Connecting to: ${MONGODB_URI.split("@").pop()}`);
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: isAtlas ? 15000 : 5000,
    });
    console.log(`[db] ✅ Connected to MongoDB${isAtlas ? " Atlas" : " (local)"}`);
  } catch (err: any) {
    if (!isAtlas && err.message.includes("ECONNREFUSED")) {
      console.error("❌ Local MongoDB is NOT running. Start it with: net start MongoDB");
    } else if (isAtlas) {
      console.error("❌ MongoDB Atlas connection failed:", err.message);
      console.error("→ Check: 1) Atlas IP Whitelist (add 0.0.0.0/0 for dev), 2) Username/password, 3) Cluster is active");
    } else {
      console.error("[db] Connection failed:", err.message);
    }
    process.exit(1);
  }

  mongoose.connection.on("error", (err) => {
    console.error("[db] Runtime error:", err);
  });
}
