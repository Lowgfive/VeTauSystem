import { createClient } from "redis";

let isRedisConnected = false;

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => {
  // Only log if it was previously connected to avoid spamming ECONNREFUSED
  if (isRedisConnected) {
    console.error("Redis Client Error", err);
  }
  isRedisConnected = false;
});

/**
 * Connect to Redis server
 */
export const connectRedis = async () => {
  try {
    await redisClient.connect();
    isRedisConnected = true;
    console.log("✅ Redis connected successfully");
  } catch (err) {
    console.warn("⚠️ Redis connection failed (Optional):", (err as Error).message);
    isRedisConnected = false;
    // Do NOT process.exit(1)
  }
};

export { redisClient, isRedisConnected };
