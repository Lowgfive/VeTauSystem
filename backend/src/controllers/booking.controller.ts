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
    // B1: User chọn seat (lock seat) - Có seat_id (và các thông tin từ frontend gởi lên)
    const { scheduleId, totalAmount, seats } = req.body as { 
        scheduleId: string; 
        totalAmount: number;
        seats: { seat_id: string; full_name: string; id_number: string; dob?: Date; gender?: string; ticket_price: number; passenger_type?: string; discount_rate?: number; base_price?: number; insurance?: number }[] 
    };
    const userId = req.user?.userId;

    if (!scheduleId || !Array.isArray(seats) || seats.length === 0) {
        return res.status(400).json({ success: false, message: "scheduleId and seats array are required" });
    }

    const schedule = await Schedule.findById(scheduleId).populate("train_id");
    if (!schedule) {
        return res.status(404).json({ success: false, message: "Schedule not found" });
    }

    const validSeatsData = [];
    for (const seatReq of seats) {
        const { seat_id, full_name, id_number, dob, gender, ticket_price, passenger_type, discount_rate, base_price, insurance } = seatReq;
        
        const seat = await Seat.findById(seat_id);
        if (!seat) {
            return res.status(404).json({ success: false, message: `Seat ID ${seat_id} not found` });
        }
        
        const seat_number = seat.seat_number;

        // 1. Check Lock
        const hasLock = await seatLockService.checkSeatLock(scheduleId, seat_number);
        if (!hasLock) {
            return res.status(409).json({ success: false, message: `Seat ${seat_number} is not locked or lock expired` });
        }

        // 2. Check if already booked
        const isBooked = await BookingPassenger.findOne({
            seat_id: seat._id,
            status: { $in: ["reserved", "confirmed", "paid"] }
        }).populate({
            path: 'booking_id',
            match: { schedule_id: scheduleId }
        });

        if (isBooked && isBooked.booking_id) {
            return res.status(409).json({ success: false, message: `Seat ${seat_number} is already booked` });
        }

        validSeatsData.push({
            seat_id: seat._id,
            seat_number: seat_number,
            ticket_price: ticket_price,
            full_name,
            id_number,
            dob,
            gender,
            passenger_type,
            discount_rate,
            base_price,
            insurance
        });
    }

    // B3: Tạo booking
    const booking = await BookingModel.create({
        user_id: new mongoose.Types.ObjectId(userId),
        schedule_id: new mongoose.Types.ObjectId(scheduleId),
        total_amount: totalAmount,
        status: "pending"
    });

    const bookingPassengers = [];
    for (const vs of validSeatsData) {
        // B2: Tạo hoặc tìm passenger
        let passenger = await Passenger.findOne({ id_number: vs.id_number });
        if (!passenger) {
            passenger = await Passenger.create({
                full_name: vs.full_name,
                id_number: vs.id_number,
                dob: vs.dob,
                gender: vs.gender
            });
        }

        // B4: Tạo booking_passenger with required structured properties
        const bp = await BookingPassenger.create({
            booking_id: booking._id,
            passenger_id: passenger._id,
            seat_id: vs.seat_id,
            ticket_price: vs.ticket_price, // Will be overridden by pre('save') if pricing exists
            status: "reserved",
            pricing: {
                basePrice: vs.base_price || vs.ticket_price,
                discountRate: vs.discount_rate || 0,
                insurance: vs.insurance || 0,
                promotion: 0,
                totalAmount: 0 // Handled by pre('save')
            }
        });
        bookingPassengers.push(bp);
    }

    // Remove locks after successful booking
    if (userId) {
        const seatNumbersArray = validSeatsData.map(vs => vs.seat_number);
        await seatLockService.unlockBatch(scheduleId, seatNumbersArray, userId);
    }

    return res.status(201).json({
        success: true,
        message: "Successfully created booking",
        data: {
            booking,
            bookingPassengers
        },
    });
});

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
        .sort({ createdAt: -1 })
        .lean();

    // Fetch booking passengers for these bookings
    const bookingsWithPassengers = await Promise.all(bookings.map(async (bk) => {
        const passengers = await BookingPassenger.find({ booking_id: bk._id })
            .populate("passenger_id")
            .populate("seat_id");
        return { ...bk, booking_passengers: passengers };
    }));

    res.status(200).json({
        success: true,
        message: "Danh sách vé của bạn",
        data: bookingsWithPassengers,
    });
});

export const getAllBookings = asyncHandler(async (req: AuthRequest, res: Response) => {
    const bookings = await BookingModel.find()
        .populate({
            path: "user_id",
            select: "name email phone"
        })
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
        .sort({ createdAt: -1 })
        .lean();

    const bookingsWithPassengers = await Promise.all(bookings.map(async (bk) => {
        const passengers = await BookingPassenger.find({ booking_id: bk._id })
            .populate("passenger_id")
            .populate("seat_id");
        return { ...bk, booking_passengers: passengers };
    }));

    res.status(200).json({
        success: true,
        message: "Danh sách tất cả vé",
        data: bookingsWithPassengers,
    });
});
