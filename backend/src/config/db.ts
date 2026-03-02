import mongoose from "mongoose";

/**
 * Kết nối MongoDB — mask password trong log
 */
export async function connectDatabase(): Promise<void> {
  const MONGO_URI = process.env.MONGO_URI?.trim();

  if (!MONGO_URI) {
    throw new Error("MONGO_URI environment variable is required");
  }

  if (!MONGO_URI.startsWith("mongodb://") && !MONGO_URI.startsWith("mongodb+srv://")) {
    throw new Error(
      `Invalid MONGO_URI format. Must start with "mongodb://" or "mongodb+srv://".`
    );
  }

  // Mask password trong log
  const maskedUri = MONGO_URI.replace(
    /mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/,
    (_m, srv, user) => `mongodb${srv || ""}://${user}:****@`
  );

  console.log(`🔄 Connecting to: ${maskedUri}`);
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
