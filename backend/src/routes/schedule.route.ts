import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import {
  autoGenSchedule,
  getSchedules,
  updateSchedule,
  getSeatMapBySchedule,
  getSeatsBySchedule,
} from "../controllers/schedule.controller";

const routerSchedule = Router();

/**
 * DEBUG: Log when schedule routes are hit
 */
routerSchedule.use((req, res, next) => {
  console.log(`[ScheduleRoute] ${req.method} ${req.originalUrl}`);
  next();
});

// Schedule management routes
routerSchedule.get("/", asyncHandler(getSchedules));
routerSchedule.post("/auto-generate", asyncHandler(autoGenSchedule));
routerSchedule.get("/:id/seatmap", asyncHandler(getSeatMapBySchedule));
routerSchedule.get("/:id/seats", asyncHandler(getSeatsBySchedule));
routerSchedule.patch("/:id", asyncHandler(updateSchedule));

/**
 * NOTE: If you add a "GET /:id" route to fetch a single schedule,
 * it MUST be defined AFTER "/:id/seats" and "/:id/seatmap"
 * otherwise it will intercept those requests.
 */

export default routerSchedule;
