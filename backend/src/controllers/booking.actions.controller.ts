import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../middlewares/auth.middleware";
import BookingModel from "../models/booking.model";
import { Seat } from "../models/seat.model";
import { Passenger } from "../models/passenger.model";
import { BookingPassenger } from "../models/bookingpassenger.model";
import mongoose from "mongoose";

const generateBookingCode = (): string => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `BK-${timestamp}-${random}`;
};

const DISCOUNT_RATES: any = {
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

    const fareDetails = calculateFareDetails(seat.price ?? 0, passenger_type || "adult");

    res.status(200).json({
        success: true,
        message: "Tính giá vé thành công",
        data: fareDetails,
    });
});

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
    
    // Support the new model layout by checking BookingPassenger for overlaps or physical status
    if (seat.status === "booked") {
        return res.status(409).json({ success: false, message: "Ghế đã được đặt" });
    }
    const isBooked = await BookingPassenger.findOne({
        seat_id: seat._id,
        status: { $in: ["reserved", "confirmed", "paid"] }
    }).populate({
         path: 'booking_id',
         match: { schedule_id: schedule_id }
    });
    
    if (isBooked && (isBooked as any).booking_id) {
        return res.status(409).json({ success: false, message: "Ghế đã được đặt trên hệ thống" });
    }

    const passenger_type = req.body.passenger_type || "adult";
    const fareDetails = calculateFareDetails(seat.price ?? 0, passenger_type);

    const booking = await BookingModel.create({
        user_id: new mongoose.Types.ObjectId(userId),
        schedule_id: new mongoose.Types.ObjectId(schedule_id),
        total_amount: fareDetails.total_fare,
        status: "pending",
    });

    let passenger = await Passenger.findOne({ id_number: req.body.id_card || "UNKNOWN" });
    if (!passenger) {
        passenger = await Passenger.create({
            full_name: req.body.passenger_name || "Unknown",
            id_number: req.body.id_card || "UNKNOWN"
        });
    }

    const bp = await BookingPassenger.create({
        booking_id: booking._id,
        passenger_id: passenger._id,
        seat_id: seat._id,
        ticket_price: fareDetails.total_fare,
        status: "reserved"
    });

    // Mark seat as physically booked
    seat.status = "booked";
    await seat.save();

    res.status(201).json({
        success: true,
        message: "Đặt vé thành công",
        data: { booking, bp },
    });
});

export const refundTicket = asyncHandler(async (req: AuthRequest, res: Response) => {
    // Both req.params.bookingId and req.body.bookingId are accepted
    const bookingId = req.params.bookingId || req.body.bookingId;
    const userId = req.user?.userId;

    if (!bookingId) {
        return res.status(400).json({ success: false, message: "Không tìm thấy mã đặt vé" });
    }

    const booking = await BookingModel.findOne({ _id: bookingId, user_id: userId });
    if (!booking) {
        return res.status(404).json({ success: false, message: "Không tìm thấy vé" });
    }

    // If pending or confirmed, allow refund
    if (!["confirmed", "pending", "reserved", "paid"].includes(booking.status)) {
        return res.status(400).json({ success: false, message: "Vé không thể hoàn trả (trạng thái không hợp lệ)" });
    }

    // Find all mapping
    const bps = await BookingPassenger.find({ booking_id: booking._id });
    const seatIds = bps.map((bp: any) => bp.seat_id);

    // Free the seat
    if (seatIds.length > 0) {
        await Seat.updateMany({ _id: { $in: seatIds } }, { status: "available" });
    }

    await BookingPassenger.updateMany({ booking_id: booking._id }, { status: "refunded" });

    // Update booking status
    booking.status = "refunded";
    await booking.save();

    res.status(200).json({
        success: true,
        message: "Hoàn vé thành công",
        data: booking,
    });
});

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

    // Allow changing if confirmed/paid
    if (!["confirmed", "paid"].includes(booking.status)) {
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

    // Handle bps logic
    const bps = await BookingPassenger.find({ booking_id: booking._id });
    if (bps.length > 0) {
        // Assume single seat for old flow backward compatibility
        const oldSeatId = bps[0].seat_id;
        await Seat.findByIdAndUpdate(oldSeatId, { status: "available" });
        bps[0].seat_id = new mongoose.Types.ObjectId(new_seat_id);
        bps[0].ticket_price = newSeat.price ?? 0;
        await bps[0].save();
    }

    // Book new seat
    newSeat.status = "booked";
    await newSeat.save();

    // Update booking
    booking.schedule_id = new mongoose.Types.ObjectId(new_schedule_id);
    booking.total_amount = newSeat.price ?? 0;
    booking.status = "changed";
    await booking.save();

    res.status(200).json({
        success: true,
        message: "Đổi lịch thành công",
        data: booking,
    });
});
