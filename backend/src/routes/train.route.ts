import { Router } from "express";
import {
    createTrain,
    getAllTrains,
    getTrainById,
    updateTrain,
    deleteTrain,
    getSeatsByCarriage,
    getSeatMap,
    generateCarriagesForTrain,
} from "../controllers/train.controller";

const router = Router();

// CRUD Tàu
router.get("/", getAllTrains);
router.post("/", createTrain);

// SeatMap (Sơ đồ ghế) - Phải đặt TRƯỚC route /:id để tránh conflict
// Lấy toàn bộ sơ đồ ghế của 1 tàu (tất cả toa + ghế nhóm theo toa)
router.get("/:id/seatmap", getSeatMap);

// Generate toa và ghế cho tàu đã tồn tại
router.post("/:id/generate-carriages", generateCarriagesForTrain);

// Lấy danh sách ghế của 1 toa cụ thể
router.get("/carriages/:carriageId/seats", getSeatsByCarriage);

// Lấy chi tiết 1 tàu (kèm danh sách toa) - Đặt SAU các route cụ thể
router.get("/:id", getTrainById);

// Cập nhật thông tin tàu
router.put("/:id", updateTrain);

// Xóa tàu (soft delete)
router.delete("/:id", deleteTrain);

export default router;
