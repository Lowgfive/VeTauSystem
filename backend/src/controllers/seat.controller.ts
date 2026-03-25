import { Request, Response } from "express";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../middlewares/auth.middleware";
import * as seatService from "../services/seat.service";
import { Schedule } from "../models/schedule.model";
import { Seat } from "../models/seat.model";
import { Station } from "../models/station.model";

export const lockSeat = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { scheduleId, departureStationId, arrivalStationId, seatId } = req.body;
  const userId = req.user?.userId;
  console.log("seatId", seatId)
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  if (!scheduleId || !departureStationId || !arrivalStationId || !seatId) {
    return res.status(400).json({
      success: false,
      message: "scheduleId, departureStationId, arrivalStationId, and seatId are required",
    });
  }

  if (
    !mongoose.Types.ObjectId.isValid(scheduleId) ||
    !mongoose.Types.ObjectId.isValid(departureStationId) ||
    !mongoose.Types.ObjectId.isValid(arrivalStationId) ||
    !mongoose.Types.ObjectId.isValid(seatId)
  ) {
    return res.status(400).json({ success: false, message: "Invalid ObjectIds in request" });
  }

  const [depStation, arrStation, schedule, seat] = await Promise.all([
    Station.findById(departureStationId).lean(),
    Station.findById(arrivalStationId).lean(),
    Schedule.findById(scheduleId).lean(),
    Seat.findById(seatId).lean(),
  ]);

  if (!depStation || !arrStation) {
    return res.status(404).json({ success: false, message: "Station not found" });
  }

  if (!schedule) {
    return res.status(404).json({ success: false, message: "Schedule not found" });
  }

  const trainId = String(schedule.train_id);

  if (!seat) {
    return res.status(404).json({ success: false, message: "Seat not found for this schedule/train" });
  }

  const startOrder = Math.min(depStation.station_order, arrStation.station_order);
  const endOrder = Math.max(depStation.station_order, arrStation.station_order);

  const isBooked = await seatService.hasBookedSeatConflict(
    scheduleId,
    seatId,
    startOrder,
    endOrder
  );

  if (isBooked) {
    return res.status(409).json({
      success: false,
      message: "Seat is already booked for this segment",
    });
  }

  const { success: locked, expiresAt } = await seatService.lockSeat(
    trainId,
    scheduleId,
    seatId,
    userId,
    startOrder,
    endOrder
  );

  if (!locked) {
    return res.status(409).json({
      success: false,
      message: "Seat is already locked for an overlapping segment",
    });
  }

  res.status(200).json({
    success: true,
    message: "Seat locked successfully for 5 minutes",
    data: { expiresAt },
  });
});

export const unlockSeat = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { scheduleId, seatId } = req.body;
  const userId = req.user?.userId;
  
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  if (!scheduleId || !seatId) {
    return res.status(400).json({ success: false, message: "scheduleId and seatId are required" });
  }

  const schedule = await Schedule.findById(scheduleId).select("train_id").lean();
  if (!schedule) {
    return res.status(404).json({ success: false, message: "Schedule not found" });
  }

  const result = await seatService.unlockSeat(String(schedule.train_id), scheduleId, seatId, userId);
  if (!result) {
    return res.status(403).json({
      success: false,
      message: "You do not own this lock or seat is not locked",
    });
  }

  res.status(200).json({ success: true, message: "Seat unlocked successfully" });
});

export const unlockBatch = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { scheduleId, seatIds } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  if (!scheduleId || !Array.isArray(seatIds)) {
    return res.status(400).json({ success: false, message: "scheduleId and seatIds[] are required" });
  }

  const schedule = await Schedule.findById(scheduleId).select("train_id").lean();
  if (!schedule) {
    return res.status(404).json({ success: false, message: "Schedule not found" });
  }

  const unauthorized = await seatService.unlockBatch(
    String(schedule.train_id),
    scheduleId,
    seatIds,
    userId
  );

  res.status(200).json({
    success: true,
    message: "Batch unlock processed",
    data: { unauthorized },
  });
});

export const checkSeatStatus = asyncHandler(async (req: Request, res: Response) => {
  const {
    scheduleId,
    seatId,
    departureStationId,
    arrivalStationId,
  } = req.query as {
    scheduleId: string;
    seatId: string;
    departureStationId?: string;
    arrivalStationId?: string;
  };

  if (!scheduleId || !seatId) {
    return res.status(400).json({ success: false, message: "scheduleId and seatId are required" });
  }

  let depOrder: number | undefined;
  let arrOrder: number | undefined;
  const schedule = await Schedule.findById(scheduleId).select("train_id").lean();

  if (!schedule) {
    return res.status(404).json({ success: false, message: "Schedule not found" });
  }

  if (departureStationId && arrivalStationId) {
    const [depStation, arrStation] = await Promise.all([
      Station.findById(departureStationId).select("station_order").lean(),
      Station.findById(arrivalStationId).select("station_order").lean(),
    ]);

    depOrder = depStation?.station_order;
    arrOrder = arrStation?.station_order;
  }

  const isLocked = await seatService.checkSeatLock(
    String(schedule.train_id),
    seatId,
    undefined,
    depOrder,
    arrOrder
  );
  res.status(200).json({ success: true, data: { isLocked } });
});

export const unlockSeatById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { seatId } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const seatIdStr = Array.isArray(seatId) ? seatId[0] : seatId;
  if (!seatIdStr || !mongoose.Types.ObjectId.isValid(seatIdStr)) {
    return res.status(400).json({ success: false, message: "Invalid seatId" });
  }

  const seat = await Seat.findById(seatIdStr).select("_id").lean();
  if (!seat) {
    return res.status(404).json({ success: false, message: "Seat not found" });
  }

  const result = await seatService.unlockSeatByIdForUser(seatIdStr, userId);

  if (result.forbidden) {
    return res.status(403).json({
      success: false,
      message: "You do not own this lock",
    });
  }

  if (!result.success) {
    return res.status(404).json({
      success: false,
      message: "Seat is not locked by current user",
    });
  }

  res.status(200).json({ success: true, message: "Seat unlocked successfully" });
});
