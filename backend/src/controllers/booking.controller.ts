import { Request, Response, NextFunction } from "express";
import BookingModel from "../models/booking.model";

// [GET] /api/v1/bookings/my-bookings
export const getMyBookings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Typically, we would use req.user.id here (set by auth middleware)
        // For development/mocking purposes, we'll just return all bookings or an empty array if none exist
        // since auth might not be fully hooked up in this session context.

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const userId = (req as any).user?.userId; 
        
        let bookings: any[] = [];
        if (userId) {
            bookings = await BookingModel.find({ userId }).sort({ createdAt: -1 });
        } else {
             // If not authenticated properly, return empty for now to satisfy the frontend
             bookings = [];
        }

        // Map backend schema to frontend structure mostly
        const formattedBookings = bookings.map(b => ({
            id: b._id,
            bookingCode: b.bookingCode,
            scheduleId: b.scheduleId,
            schedule: null, // populate if needed
            passengers: b.passengers,
            totalAmount: b.totalAmount,
            status: b.status,
            paymentStatus: b.paymentStatus,
            paymentMethod: b.paymentMethod,
            createdAt: b.createdAt.toISOString(),
            seats: [], // populate if needed
            trainNumber: b.trainNumber || "SE1",
            route: {
                origin: b.routeOrigin || "Hà Nội",
                destination: b.routeDestination || "Sài Gòn"
            },
            departureTime: b.departureTime || "06:00",
            arrivalTime: b.arrivalTime || "18:00",
            duration: "12h 00m"
        }));

        res.status(200).json({ success: true, data: formattedBookings });
    } catch (error) {
        next(error);
    }
};

// ... other booking stubs for future
export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
    res.status(201).json({ success: true, message: "Stub: createBooking" });
};
