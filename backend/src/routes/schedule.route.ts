import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { 
  autoGenSchedule, 
  getSchedules, 
  updateSchedule, 
  getSeatMapBySchedule, 
  getSeatsBySchedule 
} from "../controllers/schedule.controller";
import { SearchController } from "../controllers/search.controller";

const routerSchedule = Router();

/**
 * DEBUG: Log when schedule routes are hit
 */
routerSchedule.use((req, res, next) => {
  console.log(`[ScheduleRoute] ${req.method} ${req.originalUrl}`);
  next();
});

// ─── TÌM KIẾM CHUYẾN ĐI (USER) ───────────────────────────────────────────────
routerSchedule.post("/", asyncHandler(SearchController.search));

// ─── QUẢN LÝ CRUD CHUYẾN ĐI (ADMIN) ──────────────────────────────────────────

// 1. Lấy danh sách schedule
routerSchedule.get("/", asyncHandler(getSchedules));

// 2. Tự động sinh schedule (Tránh nhầm với :id)
routerSchedule.post("/auto-generate", asyncHandler(autoGenSchedule));

// 3. Lấy sơ đồ ghế theo schedule (admin) - Define SPECIFIC routes BEFORE general :id
routerSchedule.get("/:id/seatmap", asyncHandler(getSeatMapBySchedule));

// 4. Seat map for booking - MUST be before GET /:id if it existed
routerSchedule.get("/:id/seats", asyncHandler(getSeatsBySchedule));

// 5. Cập nhật schedule
routerSchedule.patch("/:id", asyncHandler(updateSchedule));

/**
 * NOTE: If you add a "GET /:id" route to fetch a single schedule, 
 * it MUST be defined AFTER "/:id/seats" and "/:id/seatmap" 
 * otherwise it will intercept those requests.
 */

export default routerSchedule;
