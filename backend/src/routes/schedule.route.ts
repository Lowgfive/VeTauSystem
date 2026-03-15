import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { autoGenSchedule, getSchedules, updateSchedule } from "../controllers/schedule.controller";
import { SearchController } from "../controllers/search.controller";

const routerSchedule = Router();

// --- TÌM KIẾM CHUYẾN ĐI (USER) ---
routerSchedule.post("/", asyncHandler(SearchController.search));

// --- QUẢN LÝ CRUD CHUYẾN ĐI (ADMIN) ---
// Lấy danh sách schedule
routerSchedule.get("/", asyncHandler(getSchedules));

// Cập nhật schedule
routerSchedule.patch("/:id", asyncHandler(updateSchedule));

// Tự động sinh schedule
routerSchedule.post(
  "/auto-generate",
  asyncHandler(autoGenSchedule)
);

export default routerSchedule;

