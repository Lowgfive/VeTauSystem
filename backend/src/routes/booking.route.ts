import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
    bookTicket,
    getMyBookings,
    refundTicket,
    changeSchedule,
    calculateFare,
} from "../controllers/booking.controller";

const router = express.Router();

router.post("/calculate-fare", calculateFare);

// All routes BELOW this line require login (existing authMiddleware)
router.use(authMiddleware);

// POST /api/v1/bookings/book
router.post("/book", bookTicket);

// GET /api/v1/bookings/my-bookings
router.get("/my-bookings", getMyBookings);

// POST /api/v1/bookings/refund/:bookingId
router.post("/refund/:bookingId", refundTicket);

// POST /api/v1/bookings/change-schedule/:bookingId
router.post("/change-schedule/:bookingId", changeSchedule);

export default router;
