import express from "express";
import * as seatController from "../controllers/seat.controller";

const router = express.Router();

router.post("/lock", seatController.lockSeat);
router.post("/unlock", seatController.unlockSeat);
router.get("/check", seatController.checkSeatStatus);

export default router;
