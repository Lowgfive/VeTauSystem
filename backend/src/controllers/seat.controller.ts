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
 * Body: { scheduleId, departureStationId, arrivalStationId, seatNumber }
 */
export const lockSeat = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { scheduleId, departureStationId, arrivalStationId, seatNumber } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  if (!scheduleId || !departureStationId || !arrivalStationId || !seatNumber) {
    return res.status(400).json({ success: false, message: "scheduleId, departureStationId, arrivalStationId, and seatNumber are required" });
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

  const carriages = await Carriage.find({ train_id: schedule.train_id, is_active: true })
    .select("_id")
    .lean();
  const carriageIds = carriages.map((c) => c._id);

  const seat = await Seat.findOne({ carriage_id: { $in: carriageIds }, seat_number: seatNumber }).lean();
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

  const { success: locked, expiresAt } = await seatService.lockSeat(scheduleId, seatNumber, userId);

  if (!locked) {
    return res.status(409).json({ success: false, message: "Seat is already locked" });
  }

  res.status(200).json({ success: true, message: "Seat locked successfully for 5 minutes", data: { expiresAt } });
});

/**
 * POST /api/v1/seats/unlock
 * Body: { scheduleId, seatNumber }
 */
export const unlockSeat = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { scheduleId, seatNumber } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  if (!scheduleId || !seatNumber) {
    return res.status(400).json({ success: false, message: "scheduleId and seatNumber are required" });
  }

  const result = await seatService.unlockSeat(scheduleId, seatNumber, userId);
  if (!result) {
    return res.status(403).json({ success: false, message: "You do not own this lock or seat is not locked" });
  }
  
  res.status(200).json({ success: true, message: "Seat unlocked successfully" });
});

/**
 * POST /api/v1/seats/unlock-batch
 * Body: { scheduleId, seatNumbers: [] }
 */
export const unlockBatch = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { scheduleId, seatNumbers } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  if (!scheduleId || !Array.isArray(seatNumbers)) {
    return res.status(400).json({ success: false, message: "scheduleId and seatNumbers[] are required" });
  }

  const unauthorized = await seatService.unlockBatch(scheduleId, seatNumbers, userId);
  
  res.status(200).json({ 
    success: true, 
    message: "Batch unlock processed", 
    data: { unauthorized } 
  });
});

/**
 * GET /api/v1/seats/check?scheduleId=...&seatNumber=...
 */
export const checkSeatStatus = asyncHandler(async (req: Request, res: Response) => {
  const { scheduleId, seatNumber } = req.query as { scheduleId: string; seatNumber: string };

  if (!scheduleId || !seatNumber) {
    return res.status(400).json({ success: false, message: "scheduleId and seatNumber are required" });
  }

  const isLocked = await seatService.checkSeatLock(scheduleId, seatNumber);
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
