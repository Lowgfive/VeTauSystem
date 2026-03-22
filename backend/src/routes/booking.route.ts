import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
    createBooking,
    getMyBookings,
    getAllBookings,
} from "../controllers/booking.controller";
import {
    bookTicket,
    refundTicket,
    changeSchedule,
    calculateFare
} from "../controllers/booking.actions.controller";

const router = express.Router();

router.post("/calculate-fare", calculateFare);

// All routes BELOW this line require login (existing authMiddleware)
router.use(authMiddleware);

// POST /api/v1/bookings/book
router.post("/book", bookTicket);

// POST /api/v1/bookings/create
router.post("/create", createBooking);

// POST /api/v1/bookings (fallback for compatibility)
router.post("/", createBooking);

// GET /api/v1/bookings/my-bookings
router.get("/my-bookings", getMyBookings);

// GET /api/v1/bookings/all (Admin - Get all bookings)
router.get("/all", getAllBookings);

// POST /api/v1/bookings/refund/:bookingId
router.post("/refund/:bookingId", refundTicket);

// Support without param path for backward compatibility with frontend structure
router.post("/refund", refundTicket);

// POST /api/v1/bookings/change-schedule/:bookingId
router.post("/change-schedule/:bookingId", changeSchedule);

export default router;
