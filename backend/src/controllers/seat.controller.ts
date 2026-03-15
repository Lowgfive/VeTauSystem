import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import * as seatService from "../services/seat.service";

/**
 * POST /api/v1/seats/lock
 * Body: { scheduleId, seatNumber }
 */
export const lockSeat = asyncHandler(async (req: Request, res: Response) => {
  const { scheduleId, seatNumber } = req.body;

  if (!scheduleId || !seatNumber) {
    return res.status(400).json({ success: false, message: "scheduleId and seatNumber are required" });
  }

  const locked = await seatService.lockSeat(scheduleId, seatNumber);

  if (!locked) {
    return res.status(409).json({ success: false, message: "Seat is already locked" });
  }

  res.status(200).json({ success: true, message: "Seat locked successfully for 5 minutes" });
});

/**
 * POST /api/v1/seats/unlock
 * Body: { scheduleId, seatNumber }
 */
export const unlockSeat = asyncHandler(async (req: Request, res: Response) => {
  const { scheduleId, seatNumber } = req.body;

  if (!scheduleId || !seatNumber) {
    return res.status(400).json({ success: false, message: "scheduleId and seatNumber are required" });
  }

  await seatService.unlockSeat(scheduleId, seatNumber);
  res.status(200).json({ success: true, message: "Seat unlocked successfully" });
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
