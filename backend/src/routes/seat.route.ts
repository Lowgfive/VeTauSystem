import express from "express";
import * as seatController from "../controllers/seat.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = express.Router();

router.get("/check", seatController.checkSeatStatus);

router.use(authMiddleware);
router.post("/lock", seatController.lockSeat);
router.post("/unlock", seatController.unlockSeat);
router.post("/unlock-batch", seatController.unlockBatch);
router.delete("/unlock/:seatId", seatController.unlockSeatById);

export default router;
