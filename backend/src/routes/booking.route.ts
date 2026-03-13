import express from "express";
import * as bookingController from "../controllers/booking.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = express.Router();

// Get the user's bookings (requires authentication usually, but we'll protect it)
router.get("/my-bookings", authMiddleware, bookingController.getMyBookings);

// Other stub routes
router.post("/create", authMiddleware, bookingController.createBooking);

export default router;
