import { redisClient } from "../config/redis";

/**
 * Lock a seat for 5 minutes (300 seconds)
 * Redis key format: seat:{scheduleId}:{seatNumber}
 */
export const lockSeat = async (scheduleId: string, seatNumber: string): Promise<boolean> => {
  const key = `seat:${scheduleId}:${seatNumber}`;
  // NX: true -> only set if the key does not exist
  // EX: 300 -> expires in 5 minutes
  const result = await redisClient.set(key, "locked", {
    EX: 300,
    NX: true,
  });
  return result === "OK";
};

/**
 * Unlock a seat manually (remove the Redis key)
 */
export const unlockSeat = async (scheduleId: string, seatNumber: string): Promise<void> => {
  const key = `seat:${scheduleId}:${seatNumber}`;
  await redisClient.del(key);
};

/**
 * Check if a seat is currently locked
 */
export const checkSeatLock = async (scheduleId: string, seatNumber: string): Promise<boolean> => {
  const key = `seat:${scheduleId}:${seatNumber}`;
  const value = await redisClient.get(key);
  return value !== null;
};
