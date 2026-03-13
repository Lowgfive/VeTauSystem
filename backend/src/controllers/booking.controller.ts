import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../middlewares/auth.middleware";
import BookingModel from "../models/booking.model";
import { Seat } from "../models/seat.model";
import mongoose from "mongoose";


const generateBookingCode = (): string => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `BK-${timestamp}-${random}`;
};

const DISCOUNT_RATES = {
    adult: 0,
    child: 0.30,   
    senior: 0.20,   
    disabled: 0.50,  
};
const TAX_RATE = 0.10; 

export const calculateFareDetails = (basePrice: number, passengerType: "adult" | "child" | "senior" | "disabled" = "adult") => {
    const discountRate = DISCOUNT_RATES[passengerType] || 0;
    const discountAmount = basePrice * discountRate;
    const afterDiscount = basePrice - discountAmount;
    const taxAmount = afterDiscount * TAX_RATE;
    const totalFare = afterDiscount + taxAmount;

    return {
        base_price: basePrice,
        discount_amount: discountAmount,
        tax_amount: taxAmount,
        total_fare: totalFare,
        passenger_type: passengerType
    };
};

export const calculateFare = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { seat_id, passenger_type } = req.body;

    if (!seat_id) {
        return res.status(400).json({ success: false, message: "Thiếu seat_id" });
    }

    const seat = await Seat.findById(seat_id);
    if (!seat) {
        return res.status(404).json({ success: false, message: "Không tìm thấy ghế" });
    }

    const fareDetails = calculateFareDetails(seat.price, passenger_type || "adult");

    res.status(200).json({
        success: true,
        message: "Tính giá vé thành công",
        data: fareDetails,
    });
});

// ─── Book Ticket ──────────────────────────────────────────────────────────────
// POST /api/v1/bookings/book
// Requires: Authorization header with Bearer token

export const bookTicket = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { schedule_id, seat_id } = req.body;
    const userId = req.user?.userId;

    if (!schedule_id || !seat_id) {
        return res.status(400).json({ success: false, message: "Thiếu schedule_id hoặc seat_id" });
    }

    // Find the seat and check availability
    const seat = await Seat.findById(seat_id);
    if (!seat) {
        return res.status(404).json({ success: false, message: "Không tìm thấy ghế" });
    }
    if (seat.status === "booked") {
        return res.status(409).json({ success: false, message: "Ghế đã được đặt" });
    }
    
    if (seat.schedule_id.toString() !== schedule_id) {
        return res.status(400).json({ success: false, message: "Ghế không thuộc lịch trình này" });
    }

    const passenger_type = req.body.passenger_type || "adult";
    const fareDetails = calculateFareDetails(seat.price, passenger_type);

    const booking = await BookingModel.create({
        user_id: new mongoose.Types.ObjectId(userId),
        schedule_id: new mongoose.Types.ObjectId(schedule_id),
        seat_id: seat._id,
        booking_code: generateBookingCode(),
        price: fareDetails.total_fare, // Save the total fare including tax and discount
    });

    // Mark seat as booked
    seat.status = "booked";
    await seat.save();

    res.status(201).json({
        success: true,
        message: "Đặt vé thành công",
        data: booking,
    });
});

// ─── Get My Bookings ──────────────────────────────────────────────────────────
// GET /api/v1/bookings/my-bookings
// Requires: Authorization header with Bearer token

export const getMyBookings = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;

    const bookings = await BookingModel.find({ user_id: userId })
        .populate({
            path: "schedule_id",
            populate: [
                { path: "train_id" },
                {
                    path: "route_id",
                    populate: [
                        { path: "departure_station_id" },
                        { path: "arrival_station_id" }
                    ]
                }
            ]
        })
        .populate("seat_id")
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        message: "Danh sách vé của bạn",
        data: bookings,
    });
});

// ─── Refund Ticket ────────────────────────────────────────────────────────────
// POST /api/v1/bookings/refund/:bookingId
// Requires: Authorization header with Bearer token

export const refundTicket = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { bookingId } = req.params;
    const userId = req.user?.userId;

    const booking = await BookingModel.findOne({ _id: bookingId, user_id: userId });
    if (!booking) {
        return res.status(404).json({ success: false, message: "Không tìm thấy vé" });
    }
    if (booking.status !== "confirmed") {
        return res.status(400).json({ success: false, message: "Vé không thể hoàn trả (trạng thái không hợp lệ)" });
    }

    // Free the seat
    await Seat.findByIdAndUpdate(booking.seat_id, { status: "available" });

    // Update booking status
    booking.status = "refunded";
    await booking.save();

    res.status(200).json({
        success: true,
        message: "Hoàn vé thành công",
        data: booking,
    });
});

// ─── Change Schedule ──────────────────────────────────────────────────────────
// POST /api/v1/bookings/change-schedule/:bookingId
// Requires: Authorization header with Bearer token
// Body: { new_schedule_id, new_seat_id }

export const changeSchedule = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { bookingId } = req.params;
    const { new_schedule_id, new_seat_id } = req.body;
    const userId = req.user?.userId;

    if (!new_schedule_id || !new_seat_id) {
        return res.status(400).json({ success: false, message: "Thiếu new_schedule_id hoặc new_seat_id" });
    }

    const booking = await BookingModel.findOne({ _id: bookingId, user_id: userId });
    if (!booking) {
        return res.status(404).json({ success: false, message: "Không tìm thấy vé" });
    }
    if (booking.status !== "confirmed") {
        return res.status(400).json({ success: false, message: "Vé không thể đổi lịch (trạng thái không hợp lệ)" });
    }

    // Check new seat availability
    const newSeat = await Seat.findById(new_seat_id);
    if (!newSeat) {
        return res.status(404).json({ success: false, message: "Không tìm thấy ghế mới" });
    }
    if (newSeat.status === "booked") {
        return res.status(409).json({ success: false, message: "Ghế mới đã được đặt" });
    }

    // Free old seat
    await Seat.findByIdAndUpdate(booking.seat_id, { status: "available" });

    // Book new seat
    newSeat.status = "booked";
    await newSeat.save();

    // Update booking
    booking.schedule_id = new mongoose.Types.ObjectId(new_schedule_id);
    booking.seat_id = new mongoose.Types.ObjectId(new_seat_id);
    booking.price = newSeat.price;
    booking.status = "changed";
    await booking.save();

    res.status(200).json({
        success: true,
        message: "Đổi lịch thành công",
        data: booking,
    });
});
