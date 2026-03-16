import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { autoGenSchedule, getSchedules, updateSchedule, getSeatMapBySchedule } from "../controllers/schedule.controller";
import { SearchController } from "../controllers/search.controller";

const routerSchedule = Router();

// --- TÌM KIẾM CHUYẾN ĐI (USER) ---
routerSchedule.post("/", asyncHandler(SearchController.search));

// --- QUẢN LÝ CRUD CHUYẾN ĐI (ADMIN) ---
// Lấy danh sách schedule
routerSchedule.get("/", asyncHandler(getSchedules));

// Lấy sơ đồ ghế theo schedule (admin)
routerSchedule.get("/:id/seatmap", asyncHandler(getSeatMapBySchedule));

// Cập nhật schedule
routerSchedule.patch("/:id", asyncHandler(updateSchedule));

// Tự động sinh schedule
routerSchedule.post(
  "/auto-generate",
  asyncHandler(autoGenSchedule)
);

export default routerSchedule;

