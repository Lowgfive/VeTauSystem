import { redisClient, isRedisConnected } from "../config/redis";

// In-memory fallback for seat locking when Redis is unavailable
const localLocks = new Map<string, { expiresAt: number }>();

/**
 * Lock a seat for 5 minutes (300 seconds)
 * Redis key format: seat:{scheduleId}:{seatNumber}
 */
export const lockSeat = async (scheduleId: string, seatNumber: string): Promise<boolean> => {
  const key = `seat:${scheduleId}:${seatNumber}`;
  
  if (isRedisConnected) {
    try {
      const result = await redisClient.set(key, "locked", {
        EX: 300,
        NX: true,
      });
      return result === "OK";
    } catch (err) {
      console.warn("Redis lock failed, falling back to memory");
    }
  }

  // Fallback to in-memory lock
  const now = Date.now();
  const existing = localLocks.get(key);
  if (existing && existing.expiresAt > now) {
    return false;
  }
  
  localLocks.set(key, { expiresAt: now + 300 * 1000 });
  return true;
};

/**
 * Unlock a seat manually (remove the Redis key)
 */
export const unlockSeat = async (scheduleId: string, seatNumber: string): Promise<void> => {
  const key = `seat:${scheduleId}:${seatNumber}`;
  
  if (isRedisConnected) {
    try {
      await redisClient.del(key);
    } catch (err) {
      // Ignore
    }
  }
  
  localLocks.delete(key);
};

/**
 * Check if a seat is currently locked
 */
export const checkSeatLock = async (scheduleId: string, seatNumber: string): Promise<boolean> => {
  const key = `seat:${scheduleId}:${seatNumber}`;
  
  if (isRedisConnected) {
    try {
      const value = await redisClient.get(key);
      if (value !== null) return true;
    } catch (err) {
      // Fallback
    }
  }

  const lock = localLocks.get(key);
  return !!(lock && lock.expiresAt > Date.now());
};
