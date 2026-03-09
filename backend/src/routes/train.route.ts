import { Router } from "express";
import {
    createTrain,
    getAllTrains,
    getTrainById,
    updateTrain,
    deleteTrain,
    getSeatsByCarriage,
    getSeatMap,
} from "../controllers/train.controller";

const router = Router();

// CRUD Tàu
router.get("/", getAllTrains);
router.post("/", createTrain);

// Lấy chi tiết 1 tàu (kèm danh sách toa)
router.get("/:id", getTrainById);

// Cập nhật thông tin tàu
router.put("/:id", updateTrain);

// Xóa tàu (soft delete)
router.delete("/:id", deleteTrain);

//SeatMap (Sơ đồ ghế)

// Lấy toàn bộ sơ đồ ghế của 1 tàu (tất cả toa + ghế nhóm theo toa)
router.get("/:id/seatmap", getSeatMap);

// Lấy danh sách ghế của 1 toa cụ thể
router.get("/carriages/:carriageId/seats", getSeatsByCarriage);

export default router;
