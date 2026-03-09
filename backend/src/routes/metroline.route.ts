import { Router } from "express";
import {
    createLine,
    getAllLines,
    getLineById,
    updateLine,
    deleteLine,
    seedLine5,
} from "../controllers/metroline.controller";

const router = Router();

// Seed tuyến 5 (gọi 1 lần để khởi tạo dữ liệu)
router.post("/seed-line5", seedLine5);

// CRUD Tuyến Metro
router.get("/", getAllLines);
router.post("/", createLine);
router.get("/:id", getLineById);
router.put("/:id", updateLine);
router.delete("/:id", deleteLine);

export default router;
