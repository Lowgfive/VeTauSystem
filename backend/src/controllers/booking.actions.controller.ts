import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../middlewares/auth.middleware";
import BookingModel from "../models/booking.model";
import { Seat } from "../models/seat.model";
import { Passenger } from "../models/passenger.model";
import { BookingPassenger } from "../models/bookingpassenger.model";
import { Schedule } from "../models/schedule.model";
import mongoose from "mongoose";
import {
  getPassengerDiscountRate,
  validatePassengerTypeAndDob,
} from "../utils/passenger-pricing";
import { calculateRefund, canChangeTicket } from "../utils/policy";
import { WalletService } from "../services/wallet.service";

const generateBookingCode = (): string => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `BK-${timestamp}-${random}`;
};

const TAX_RATE = 0.10;

export const calculateFareDetails = (
    basePrice: number,
    passengerType: string = "adult",
    dob?: string
) => {
    const discountRate = getPassengerDiscountRate(passengerType, dob);
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
    const { seat_id, passenger_type, dob } = req.body;

    if (!seat_id) {
        return res.status(400).json({ success: false, message: "Thiếu seat_id" });
    }

    const seat = await Seat.findById(seat_id);
    if (!seat) {
        return res.status(404).json({ success: false, message: "Không tìm thấy ghế" });
    }

    const validationError = validatePassengerTypeAndDob(passenger_type, dob);
    if (validationError) {
        return res.status(400).json({ success: false, message: validationError });
    }

    const fareDetails = calculateFareDetails(seat.price ?? 0, passenger_type || "adult", dob);

    res.status(200).json({
        success: true,
        message: "Tính giá vé thành công",
        data: fareDetails,
    });
});

export const bookTicket = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { schedule_id, seat_id } = req.body;
    const userId = req.user?.userId;

    if (!schedule_id || !seat_id || !userId) {
        return res.status(400).json({ success: false, message: "Thiếu schedule_id, seat_id hoặc người dùng" });
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
    const dob = req.body.dob;

    const validationError = validatePassengerTypeAndDob(passenger_type, dob);
    if (validationError) {
        return res.status(400).json({ success: false, message: validationError });
    }

    const fareDetails = calculateFareDetails(seat.price ?? 0, passenger_type, dob);

    const scheduleDetail = await Schedule.findById(schedule_id).populate("route_id");
    
    const booking = await BookingModel.create({
        user_id: new mongoose.Types.ObjectId(userId),
        schedule_id: new mongoose.Types.ObjectId(schedule_id),
        departure_station_id: (scheduleDetail?.route_id as any)?.departure_station_id,
        arrival_station_id: (scheduleDetail?.route_id as any)?.arrival_station_id,
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

    // ─── Handle Wallet Payment ──────────────────────────────────────────────
    try {
        await WalletService.pay(
            userId as string,
            fareDetails.total_fare,
            `Thanh toán vé ${booking.booking_code || "mới"}`,
            booking._id.toString()
        );
        
        // Update booking and passenger status to paid/confirmed
        await BookingModel.updateOne({ _id: booking._id }, { status: "paid" });
        await BookingPassenger.updateOne({ _id: bp._id }, { status: "confirmed" });
        
        // Mark seat as physically booked
        seat.status = "booked";
        await seat.save();

        res.status(201).json({
            success: true,
            message: "Đặt vé và thanh toán thành công qua ví",
            data: { 
                booking: { ...booking.toObject(), status: "paid" }, 
                bp: { ...bp.toObject(), status: "confirmed" } 
            },
        });
    } catch (error: any) {
        // Rollback: Delete created records and keep seat available
        await BookingPassenger.deleteOne({ _id: bp._id });
        await BookingModel.deleteOne({ _id: booking._id });
        
        return res.status(400).json({ 
            success: false, 
            message: error.message || "Lỗi thanh toán qua ví. Vui lòng nạp thêm tiền." 
        });
    }
});

export const refundTicket = asyncHandler(async (req: AuthRequest, res: Response) => {
    const bookingId = req.params.bookingId || req.body.bookingId;
    const userId = req.user?.userId;

    if (!bookingId || !userId) {
        return res.status(400).json({ success: false, message: "Không tìm thấy mã đặt vé hoặc người dùng" });
    }

    const booking = await BookingModel.findOne({ _id: bookingId, user_id: userId }).populate("schedule_id");
    if (!booking) {
        return res.status(404).json({ success: false, message: "Không tìm thấy vé" });
    }

    if (!["confirmed", "pending", "reserved", "paid"].includes(booking.status)) {
        return res.status(400).json({ success: false, message: "Vé không thể hoàn trả (trạng thái không hợp lệ)" });
    }

    const schedule = booking.schedule_id as any;
    if (!schedule) {
        return res.status(400).json({ success: false, message: "Không tìm thấy thông tin lịch trình để tính phí hoàn" });
    }

    // 1. Calculate refund based on policy
    const { refundAmount, feeAmount, percent } = calculateRefund(
        schedule.date,
        schedule.departure_time,
        booking.total_amount,
        booking.is_group_booking
    );

    if (refundAmount === 0 && percent === 0) {
        return res.status(400).json({ 
            success: false, 
            message: "Thời gian trả vé sát giờ chạy (dưới 4h hoặc 24h đối với tập thể), không hỗ trợ hoàn tiền theo quy định." 
        });
    }

    let newBalance = 0;
    try {
        const result = await WalletService.refund(
            userId,
            refundAmount,
            `Hoàn tiền vé ${booking.booking_code} (Khấu trừ phí ${feeAmount.toLocaleString()}đ - ${100 - percent}%)`,
            booking._id.toString()
        );
        newBalance = result.balance || 0;
    } catch (error: any) {
        return res.status(500).json({ success: false, message: "Lỗi khi hoàn tiền vào ví: " + error.message });
    }

    const bps = await BookingPassenger.find({ booking_id: booking._id });
    const seatIds = bps.map((bp: any) => bp.seat_id);

    if (seatIds.length > 0) {
        await Seat.updateMany({ _id: { $in: seatIds } }, { status: "available" });
    }

    await BookingPassenger.updateMany({ booking_id: booking._id }, { status: "refunded" });
    await BookingModel.updateOne({ _id: booking._id }, { status: "refunded" });
    booking.status = "refunded";

    res.status(200).json({
        success: true,
        message: `Hủy vé thành công. Số tiền ${refundAmount.toLocaleString()}đ đã được hoàn vào ví.`,
        data: {
            booking,
            refundAmount,
            feeAmount,
            refundPercent: percent,
            newBalance
        },
    });
});

export const changeSchedule = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { bookingId } = req.params;
    const { new_schedule_id, new_seat_ids } = req.body;
    const userId = req.user?.userId;

    if (!new_schedule_id || !new_seat_ids || !Array.isArray(new_seat_ids) || new_seat_ids.length === 0 || !userId) {
        return res.status(400).json({ success: false, message: "Thiếu dữ liệu yêu cầu" });
    }

    const booking = await BookingModel.findOne({ _id: bookingId, user_id: userId }).populate("schedule_id");
    if (!booking) {
        return res.status(404).json({ success: false, message: "Không tìm thấy vé" });
    }

    if (!["confirmed", "paid"].includes(booking.status)) {
        return res.status(400).json({ success: false, message: "Vé không thể đổi lịch (trạng thái không hợp lệ)" });
    }

    const oldSchedule = booking.schedule_id as any;
    const newSchedule = await Schedule.findById(new_schedule_id);
    if (!oldSchedule || !newSchedule) {
        return res.status(404).json({ success: false, message: "Thông tin lịch trình không hợp lệ" });
    }

    // 1. Check change policy (time limit and fee)
    const changeCheck = canChangeTicket(
        oldSchedule.date,
        oldSchedule.departure_time,
        booking.is_group_booking
    );

    if (!changeCheck.allowed) {
        return res.status(400).json({ success: false, message: changeCheck.reason });
    }

    const changeFee = (changeCheck.fee || 0) * new_seat_ids.length;

    // 2. Check new seats availability and calculate new total
    const newSeats = await Seat.find({ _id: { $in: new_seat_ids } });
    if (newSeats.length !== new_seat_ids.length) {
        return res.status(404).json({ success: false, message: "Một số ghế mới không tìm thấy" });
    }
    
    const unavailableSeats = newSeats.filter(s => s.status === "booked");
    if (unavailableSeats.length > 0) {
        return res.status(409).json({ 
            success: false, 
            message: `Ghế ${unavailableSeats.map(s => s.seat_number).join(", ")} đã được đặt` 
        });
    }

    const newTotalAmount = newSeats.reduce((sum, s) => sum + (s.price ?? 0), 0);
    const priceDifference = newTotalAmount - booking.total_amount;
    const totalToPay = priceDifference + changeFee;

    let newBalance = 0;
    try {
        if (totalToPay > 0) {
            // User needs to pay more (price increase + fee)
            const result = await WalletService.pay(
                userId,
                totalToPay,
                `Thanh toán chênh lệch đổi vé và phí (${changeFee.toLocaleString()}đ) cho vé ${booking.booking_code}`,
                booking._id.toString()
            );
            newBalance = result.balance;
        } else if (totalToPay < 0) {
            // Refund the difference (price decrease - fee)
            const result = await WalletService.refund(
                userId,
                Math.abs(totalToPay),
                `Hoàn tiền chênh lệch đổi vé (khấu trừ phí ${changeFee.toLocaleString()}đ) cho vé ${booking.booking_code}`,
                booking._id.toString()
            );
            newBalance = result.balance || 0;
        } else if (changeFee > 0) {
            // Price is same, but fee still applies
            const result = await WalletService.pay(
                userId,
                changeFee,
                `Thanh toán phí đổi vé (${changeFee.toLocaleString()}đ) cho vé ${booking.booking_code}`,
                booking._id.toString()
            );
            newBalance = result.balance;
        }
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message || "Lỗi giao dịch ví" });
    }

    // 4. Update seats and booking
    const bps = await BookingPassenger.find({ booking_id: booking._id });
    const oldSeatIds = bps.map(bp => bp.seat_id);
    await Seat.updateMany({ _id: { $in: oldSeatIds } }, { status: "available" });

    for (let i = 0; i < bps.length; i++) {
        if (new_seat_ids[i]) {
            const newSeatData = newSeats.find(s => s._id.toString() === new_seat_ids[i].toString());
            bps[i].seat_id = new mongoose.Types.ObjectId(new_seat_ids[i]);
            bps[i].ticket_price = newSeatData?.price ?? 0;
            bps[i].status = "confirmed";
            await bps[i].save();
        }
    }

    await Seat.updateMany({ _id: { $in: new_seat_ids } }, { status: "booked" });

    await BookingModel.updateOne(
        { _id: booking._id },
        {
            schedule_id: new mongoose.Types.ObjectId(new_schedule_id),
            total_amount: newTotalAmount,
            status: "changed"
        }
    );
    booking.status = "changed";

    res.status(200).json({
        success: true,
        message: `Đổi lịch thành công. ${totalToPay > 0 ? `Đã trừ ${totalToPay.toLocaleString()}đ từ ví.` : totalToPay < 0 ? `Đã hoàn ${Math.abs(totalToPay).toLocaleString()}đ vào ví.` : `Đã trừ phí ${changeFee.toLocaleString()}đ từ ví.`}`,
        data: {
            booking,
            priceDifference,
            changeFee,
            totalToPay,
            newBalance
        },
    });
});
