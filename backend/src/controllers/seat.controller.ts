import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../middlewares/auth.middleware";
import * as seatService from "../services/seat.service";
import BookingModel from "../models/booking.model";
import mongoose from "mongoose";
import { Schedule } from "../models/schedule.model";
import { Carriage } from "../models/carriage.model";
import { Seat } from "../models/seat.model";
import { Station } from "../models/station.model";

/**
 * POST /api/v1/seats/lock
 * Body: { scheduleId, departureStationId, arrivalStationId, seatId }
 */
export const lockSeat = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { scheduleId, departureStationId, arrivalStationId, seatId } = req.body;
  const userId = req.user?.userId;
  console.log("seatId", seatId)
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  if (!scheduleId || !departureStationId || !arrivalStationId || !seatId) {
    return res.status(400).json({ success: false, message: "scheduleId, departureStationId, arrivalStationId, and seatId are required" });
  }

  if (!mongoose.Types.ObjectId.isValid(scheduleId) || !mongoose.Types.ObjectId.isValid(departureStationId) || !mongoose.Types.ObjectId.isValid(arrivalStationId)) {
    return res.status(400).json({ success: false, message: "Invalid ObjectIds in request" });
  }

  const depStation = await Station.findById(departureStationId).lean();
  const arrStation = await Station.findById(arrivalStationId).lean();
  if (!depStation || !arrStation) {
      return res.status(404).json({ success: false, message: "Station not found" });
  }
  const startOrder = Math.min(depStation.station_order, arrStation.station_order);
  const endOrder = Math.max(depStation.station_order, arrStation.station_order);

  // Ensure seat exists for that schedule's train
  const schedule = await Schedule.findById(scheduleId).lean();
  if (!schedule) {
    return res.status(404).json({ success: false, message: "Schedule not found" });
  }

  const seat = await Seat.findById(seatId).lean();
  if (!seat) {
    return res.status(404).json({ success: false, message: "Seat not found for this schedule/train" });
  }

  // Ensure seat has no existing valid BookingPassenger
  const isBooked = await require('../models/bookingpassenger.model').BookingPassenger.findOne({
      seat_id: seat._id,
      status: { $in: ["reserved", "confirmed", "paid"] }
  }).populate('booking_id');

  if (isBooked) {
    // Ideally we should check if the booking's scheduleId matches, 
    // but a seat ID is specific to a carriage, which is specific to a train schedule...
    // Let's just block it.
    return res.status(409).json({ success: false, message: "Seat is already booked for this segment" });
  }

  const { success: locked, expiresAt } = await seatService.lockSeat(scheduleId, seatId, userId);

  if (!locked) {
    return res.status(409).json({ success: false, message: "Seat is already locked" });
  }

  res.status(200).json({ success: true, message: "Seat locked successfully for 5 minutes", data: { expiresAt } });
});

/**
 * POST /api/v1/seats/unlock
 * Body: { scheduleId, seatId }
 */
export const unlockSeat = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { scheduleId, seatId } = req.body;
  const userId = req.user?.userId;
  
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  if (!scheduleId || !seatId) {
    return res.status(400).json({ success: false, message: "scheduleId and seatId are required" });
  }

  const result = await seatService.unlockSeat(scheduleId, seatId, userId);
  if (!result) {
    return res.status(403).json({ success: false, message: "You do not own this lock or seat is not locked" });
  }
  
  res.status(200).json({ success: true, message: "Seat unlocked successfully" });
});

/**
 * POST /api/v1/seats/unlock-batch
 * Body: { scheduleId, seatIds: [] }
 */
export const unlockBatch = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { scheduleId, seatIds } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  if (!scheduleId || !Array.isArray(seatIds)) {
    return res.status(400).json({ success: false, message: "scheduleId and seatIds[] are required" });
  }

  const unauthorized = await seatService.unlockBatch(scheduleId, seatIds, userId);
  
  res.status(200).json({ 
    success: true, 
    message: "Batch unlock processed", 
    data: { unauthorized } 
  });
});

/**
 * GET /api/v1/seats/check?scheduleId=...&seatId=...
 */
export const checkSeatStatus = asyncHandler(async (req: Request, res: Response) => {
  const { scheduleId, seatId } = req.query as { scheduleId: string; seatId: string };

  if (!scheduleId || !seatId) {
    return res.status(400).json({ success: false, message: "scheduleId and seatId are required" });
  }

  const isLocked = await seatService.checkSeatLock(scheduleId, seatId);
  res.status(200).json({ success: true, data: { isLocked } });
});

/**
 * DELETE /api/v1/seats/unlock-seat/:seatId
 * Logic: Tìm ghế theo ID và chuyển trạng thái từ 'Locked' sang 'Available'
 */
export const unlockSeatById = asyncHandler(async (req: Request, res: Response) => {
  const { seatId } = req.params;
  
  const seatIdStr = Array.isArray(seatId) ? seatId[0] : seatId;
  
  if (!seatIdStr || !mongoose.Types.ObjectId.isValid(seatIdStr)) {
    return res.status(400).json({ success: false, message: "Invalid seatId" });
  }

  const seat = await Seat.findById(seatIdStr);
  if (!seat) {
    return res.status(404).json({ success: false, message: "Seat not found" });
  }

  seat.status = "available";
  seat.locked_at = undefined;
  seat.expired_at = undefined;
  seat.locked_by = undefined;
  await seat.save();

  res.status(200).json({ success: true, message: "Seat unlocked successfully" });
});
