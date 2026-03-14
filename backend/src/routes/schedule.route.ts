import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { autoGenSchedule } from "../controllers/schedule.controller";


const routerSchedule = Router();

// POST /api/v1/schedules/auto-generate
routerSchedule.post(
  "/auto-generate",
  asyncHandler(autoGenSchedule)
);


export default routerSchedule;

