import { getIO } from "../config/socket";
import { Seat } from "../models/seat.model";
import { Schedule } from "../models/schedule.model";
import { Carriage } from "../models/carriage.model";
import mongoose from "mongoose";

export const lockSeat = async (scheduleId: string, seatNumber: string, userId: string): Promise<{ success: boolean; expiresAt?: number }> => {
  const schedule = await Schedule.findById(scheduleId).lean();
  if (!schedule) return { success: false };

  const carriages = await Carriage.find({ train_id: schedule.train_id }).select("_id").lean();
  const carriageIds = carriages.map((c) => c._id);

  const seat = await Seat.findOne({ carriage_id: { $in: carriageIds }, seat_number: seatNumber });
  if (!seat) return { success: false };

  const now = new Date();

  // Requirement 3 & 5: If seat is booked, or locked AND not expired -> reject
  if (seat.status === "booked") return { success: false };
  if (seat.status === "locked" && seat.expired_at && seat.expired_at > now) {
    return { success: false };
  }

  // Requirement 1: Save locked_at and expired_at (current time + 5 mins), Status = "locked"
  seat.status = "locked";
  seat.locked_at = now;
  seat.expired_at = new Date(now.getTime() + 5 * 60 * 1000); 
  seat.locked_by = new mongoose.Types.ObjectId(userId);
  await seat.save();

  try {
    getIO().to(`schedule:${scheduleId}`).emit("seat-locked", { scheduleId, seatNumber });
  } catch (error) {
    console.error("Socket emit error:", error);
  }

  return { success: true, expiresAt: seat.expired_at.getTime() };
};

export const unlockSeat = async (scheduleId: string, seatNumber: string, userId: string): Promise<boolean> => {
  const schedule = await Schedule.findById(scheduleId).lean();
  if (!schedule) return false;

  const carriages = await Carriage.find({ train_id: schedule.train_id }).select("_id").lean();
  const seat = await Seat.findOne({ carriage_id: { $in: carriages.map(c => c._id) }, seat_number: seatNumber });
  if (!seat) return true;

  // Requirement 2: Do NOT unlock seats when user navigates away or refreshes the page
  // The system used to call unlock on unmount. We must stop calling this from frontend on unmount, 
  // but if the API is called, we will check ownership.
  if (seat.locked_by && seat.locked_by.toString() !== userId) return false;

  seat.status = "available";
  seat.locked_at = undefined;
  seat.expired_at = undefined;
  seat.locked_by = undefined;
  await seat.save();

  try {
    getIO().to(`schedule:${scheduleId}`).emit("seat-unlocked", { scheduleId, seatNumber });
  } catch (error) {
    console.error("Socket emit error:", error);
  }

  return true;
};

export const unlockBatch = async (
  scheduleId: string,
  seatNumbers: string[],
  userId: string
): Promise<string[]> => {
  const schedule = await Schedule.findById(scheduleId).lean();
  if (!schedule) return seatNumbers;

  const carriages = await Carriage.find({ train_id: schedule.train_id }).select("_id").lean();
  const carriageIds = carriages.map((c) => c._id);

  const unauthorizedSeats: string[] = [];
  const seatsToUnlock = [];

  for (const sn of seatNumbers) {
    const seat = await Seat.findOne({ carriage_id: { $in: carriageIds }, seat_number: sn });
    if (!seat) continue;
    
    // Only unlock if we own it
    if (seat.locked_by && seat.locked_by.toString() === userId) {
      seatsToUnlock.push(seat);
    } else if (seat.locked_by) {
      unauthorizedSeats.push(sn);
    }
  }

  for (const seat of seatsToUnlock) {
    seat.status = "available";
    seat.locked_at = undefined;
    seat.expired_at = undefined;
    seat.locked_by = undefined;
    await seat.save();
    try {
      getIO().to(`schedule:${scheduleId}`).emit("seat-unlocked", { scheduleId, seatNumber: seat.seat_number });
    } catch(e) {}
  }

  return unauthorizedSeats;
};

export const checkSeatLock = async (scheduleId: string, seatNumber: string, userId?: string): Promise<boolean> => {
  const schedule = await Schedule.findById(scheduleId).lean();
  if (!schedule) return false;

  const carriages = await Carriage.find({ train_id: schedule.train_id }).select("_id").lean();
  const seat = await Seat.findOne({ carriage_id: { $in: carriages.map(c => c._id) }, seat_number: seatNumber });
  if (!seat) return false;

  const now = new Date();
  // Requirement 3: A seat is considered available if status != "locked" OR expired_at < current_time
  if (seat.status === "locked" && seat.expired_at && seat.expired_at > now) {
    // If a userId is passed, we check if the lock belongs to this userId
    if (userId) {
       return seat.locked_by?.toString() === userId;
    }
    return true; // it's validly locked
  }
  
  return false;
};

export const checkSeatLocksBulk = async (
  scheduleId: string,
  seatNumbers: string[]
): Promise<Record<string, boolean>> => {
  const schedule = await Schedule.findById(scheduleId).lean();
  if (!schedule) return {};

  const carriages = await Carriage.find({ train_id: schedule.train_id }).select("_id").lean();
  const carriageIds = carriages.map((c) => c._id);

  const seats = await Seat.find({ carriage_id: { $in: carriageIds }, seat_number: { $in: seatNumbers } });
  
  const now = new Date();
  const result: Record<string, boolean> = {};
  
  for (const sn of seatNumbers) {
     const seat = seats.find(s => s.seat_number === sn);
     if (!seat) {
        result[sn] = false;
        continue;
     }
     if (seat.status === "locked" && seat.expired_at && seat.expired_at > now) {
        result[sn] = true;
     } else {
        result[sn] = false;
     }
  }

  return result;
};
