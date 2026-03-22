import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../middlewares/auth.middleware";
import BookingModel from "../models/booking.model";
import { Seat } from "../models/seat.model";
import { Passenger } from "../models/passenger.model";
import { BookingPassenger } from "../models/bookingpassenger.model";
import mongoose from "mongoose";
import { Schedule } from "../models/schedule.model";
import * as seatLockService from "../services/seat.service";

export const createBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { scheduleId, totalAmount, seats, departureStationId, arrivalStationId } = req.body as {
        scheduleId: string;
        departureStationId?: string;
        arrivalStationId?: string;
        totalAmount: number;
        seats: {
            seat_id: string;
            full_name: string;
            id_number: string;
            dob?: string;
            gender?: string;
            ticket_price: number;
            passenger_type?: string;
            discount_rate?: number;
            base_price?: number;
            insurance?: number;
        }[];
    };
    const userId = req.user?.userId;

    if (!scheduleId || !Array.isArray(seats) || seats.length === 0) {
        return res.status(400).json({ success: false, message: "Thiếu scheduleId hoặc danh sách ghế" });
    }

    if (!userId) {
        return res.status(401).json({ success: false, message: "Cần đăng nhập để đặt vé" });
    }

    const schedule: any = await Schedule.findById(scheduleId).populate("train_id").populate("route_id");
    if (!schedule) {
        return res.status(404).json({ success: false, message: "Không tìm thấy chuyến tàu" });
    }


    const validSeatsData: any[] = [];

    const routeBasePrice = schedule.route_id?.price || 500000;
    const insuranceFee = 1000;

    const getSeatTypeMultiplier = (seatType: string): number => {
        switch (seatType) {
            case "hard_seat": return 0.8;
            case "soft_seat": return 1.0;
            case "sleeper_6": return 1.5;
            case "sleeper_4": return 1.8;
            case "vip_sleeper_2": return 2.5;
            default: return 1.0;
        }
    };

    const getDiscountRate = (type?: string) => {
        if (type === 'Trẻ em') return 0.25;
        if (type === 'Sinh viên') return 0.1;
        if (type === 'Người cao tuổi') return 0.15;
        return 0;
    };

    let calculatedTotalAmount = 0;

    for (const seatReq of seats) {
        const { seat_id, full_name, id_number, dob, gender, ticket_price, passenger_type, discount_rate, base_price, insurance } = seatReq;

        const seat = await Seat.findById(seat_id);
        if (!seat) {
            return res.status(404).json({ success: false, message: `Không tìm thấy ghế ID: ${seat_id}` });
        }

        const seat_number = seat.seat_number;

        // Kiểm tra lock
        const hasLock = await seatLockService.checkSeatLock(scheduleId, seat_id);
        if (!hasLock) {
            return res.status(409).json({
                success: false,
                message: `Ghế ${seat_number} chưa được giữ chỗ hoặc đã hết hạn. Vui lòng chọn lại.`
            });
        }

        // Kiểm tra đã đặt chưa
        const isBooked = await BookingPassenger.findOne({
            seat_id: seat._id,
            status: { $in: ["reserved", "confirmed", "paid"] }
        }).populate({
            path: "booking_id",
            match: { schedule_id: scheduleId }
        });

        if (isBooked && isBooked.booking_id) {
            return res.status(409).json({ success: false, message: `Ghế ${seat_number} đã được đặt` });
        }

        const actualBasePrice = Math.round(routeBasePrice * getSeatTypeMultiplier(seat.seat_type || "soft_seat"));
        const safeActualDiscount = getDiscountRate(passenger_type);
        const actualTicketPrice = (actualBasePrice * (1 - safeActualDiscount)) + insuranceFee;

        calculatedTotalAmount += actualTicketPrice;

        validSeatsData.push({
            seat_id: seat._id,

            seat_number,
            ticket_price,

            full_name,
            id_number,
            dob,
            gender,
            passenger_type,
            discount_rate,
            base_price,
            insurance,
        });
    }

    // Tạo booking
    const booking_code = "BK" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();

    const booking = await BookingModel.create({
        user_id: new mongoose.Types.ObjectId(userId),
        schedule_id: new mongoose.Types.ObjectId(scheduleId),

        booking_code,
        total_amount: totalAmount,
        departure_station_id: departureStationId || schedule.route_id?.departure_station_id,
        arrival_station_id: arrivalStationId || schedule.route_id?.arrival_station_id,
        status: "pending",

    });

    const bookingPassengers = [];

    for (const vs of validSeatsData) {
        let passenger = await Passenger.findOne({ id_number: vs.id_number });
        if (!passenger) {
            passenger = await Passenger.create({
                full_name: vs.full_name,
                id_number: vs.id_number,
                dob: vs.dob || null,
                gender: vs.gender || "Unknown",
            });
        }

        const bp = await BookingPassenger.create({
            booking_id: booking._id,
            passenger_id: passenger._id,
            seat_id: vs.seat_id,
            ticket_price: vs.ticket_price,
            status: "reserved",
            pricing: {
                basePrice: vs.base_price || vs.ticket_price,
                discountRate: vs.discount_rate || 0,
                insurance: vs.insurance || 0,
                promotion: 0,
                totalAmount: 0,
            },
        });

        bookingPassengers.push(bp);
    }

    // Xóa lock sau khi đặt thành công
    const seatIds = validSeatsData.map((vs) => String(vs.seat_id));
    await seatLockService.unlockBatch(scheduleId, seatIds, userId);

    return res.status(201).json({
        success: true,
        message: "Đặt chỗ thành công. Vui lòng thanh toán để hoàn tất.",
        data: { booking, bookingPassengers },
    });
});

export const getMyBookings = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;

    const bookings = await BookingModel.find({ user_id: userId })
        .populate("departure_station_id")
        .populate("arrival_station_id")
        .populate({
            path: "schedule_id",
            populate: [
                { path: "train_id" },
                {
                    path: "route_id",
                    populate: [
                        { path: "departure_station_id" },
                        { path: "arrival_station_id" },
                    ],
                },
            ],
        })
        .sort({ createdAt: -1 })
        .lean();

    const bookingsWithPassengers = await Promise.all(
        bookings.map(async (bk) => {
            const passengers = await BookingPassenger.find({ booking_id: bk._id })
                .populate("passenger_id")
                .populate("seat_id");
            return { ...bk, booking_passengers: passengers };
        })
    );

    res.status(200).json({
        success: true,
        message: "Danh sách vé của bạn",
        data: bookingsWithPassengers,
    });
});

export const getAllBookings = asyncHandler(async (req: AuthRequest, res: Response) => {
    const bookings = await BookingModel.find()
        .populate({ path: "user_id", select: "name email phone" })
        .populate("departure_station_id")
        .populate("arrival_station_id")
        .populate({
            path: "schedule_id",
            populate: [
                { path: "train_id" },
                {
                    path: "route_id",
                    populate: [
                        { path: "departure_station_id" },
                        { path: "arrival_station_id" },
                    ],
                },
            ],
        })
        .sort({ createdAt: -1 })
        .lean();

    const bookingsWithPassengers = await Promise.all(
        bookings.map(async (bk) => {
            const passengers = await BookingPassenger.find({ booking_id: bk._id })
                .populate("passenger_id")
                .populate("seat_id");
            return { ...bk, booking_passengers: passengers };
        })
    );

    res.status(200).json({
        success: true,
        message: "Danh sách tất cả vé",
        data: bookingsWithPassengers,
    });
});
