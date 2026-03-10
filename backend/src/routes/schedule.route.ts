import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ScheduleController } from "../controllers/schedule.controller";

const routerSchedule = Router();

// POST /api/v1/schedules/auto-generate
routerSchedule.post(
  "/auto-generate",
  asyncHandler(ScheduleController.autoGenerateSchedule)
);

// POST /api/v1/schedules/auto-generate/day
routerSchedule.post(
  "/auto-generate/day",
  asyncHandler(ScheduleController.autoGenerateScheduleForOneDay)
);

export default routerSchedule;

