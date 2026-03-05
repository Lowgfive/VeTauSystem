import mongoose from "mongoose";

/**
 * Kết nối MongoDB — mask password trong log
 */
export async function connectDatabase(): Promise<void> {
  const MONGO_URI = process.env.MONGO_URI?.trim();
  if (!MONGO_URI) {
    throw new Error("MONGO_URI environment variable is required");
  }
  await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  });
}

/**
 * Đóng kết nối database (dùng khi graceful shutdown)
 */
export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  console.log("🔌 Database disconnected");
}
