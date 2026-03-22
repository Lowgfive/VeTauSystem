import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../middlewares/auth.middleware";
import BookingModel from "../models/booking.model";
import { Train } from "../models/train.model";
import { Schedule } from "../models/schedule.model";
import mongoose from "mongoose";

export const getDashboardStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // 1. Basic Stats
    const totalRevenue = await BookingModel.aggregate([
        { $match: { status: { $in: ["confirmed", "paid"] } } },
        { $group: { _id: null, total: { $sum: "$price" } } }
    ]);

    const revenueThisMonth = await BookingModel.aggregate([
        { 
            $match: { 
                status: { $in: ["confirmed", "paid"] },
                createdAt: { $gte: firstDayOfMonth }
            } 
        },
        { $group: { _id: null, total: { $sum: "$price" } } }
    ]);

    const ticketsThisMonth = await BookingModel.countDocuments({
        status: { $in: ["confirmed", "paid"] },
        createdAt: { $gte: firstDayOfMonth }
    });

    const activeTrains = await Train.countDocuments({ status: "active" });
    
    // Unique passengers (users with at least one confirmed booking)
    const totalPassengers = await BookingModel.distinct("user_id", {
        status: { $in: ["confirmed", "paid"] }
    });

    // 2. Revenue by Month (Last 6 months)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const revenueByMonth = await BookingModel.aggregate([
        {
            $match: {
                status: { $in: ["confirmed", "paid"] },
                createdAt: { $gte: sixMonthsAgo }
            }
        },
        {
            $group: {
                _id: {
                    month: { $month: "$createdAt" },
                    year: { $year: "$createdAt" }
                },
                revenue: { $sum: "$price" },
                tickets: { $sum: 1 }
            }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // 3. Revenue by Route (Top 5)
    const revenueByRoute = await BookingModel.aggregate([
        { $match: { status: { $in: ["confirmed", "paid"] } } },
        {
            $lookup: {
                from: "schedules",
                localField: "schedule_id",
                foreignField: "_id",
                as: "schedule"
            }
        },
        { $unwind: "$schedule" },
        {
            $lookup: {
                from: "routes",
                localField: "schedule.route_id",
                foreignField: "_id",
                as: "route"
            }
        },
        { $unwind: "$route" },
        {
            $lookup: {
                from: "stations",
                localField: "route.departure_station_id",
                foreignField: "_id",
                as: "dep_station"
            }
        },
        { $unwind: "$dep_station" },
        {
            $lookup: {
                from: "stations",
                localField: "route.arrival_station_id",
                foreignField: "_id",
                as: "arr_station"
            }
        },
        { $unwind: "$arr_station" },
        {
            $group: {
                _id: {
                    name: { $concat: ["$dep_station.station_name", " - ", "$arr_station.station_name"] }
                },
                value: { $sum: 1 },
                revenue: { $sum: "$price" }
            }
        },
        { $sort: { revenue: -1 } },
        { $limit: 5 }
    ]);

    // 4. Revenue by Seat Type
    const revenueBySeatType = await BookingModel.aggregate([
        { $match: { status: { $in: ["confirmed", "paid"] } } },
        {
            $lookup: {
                from: "seats",
                localField: "seat_id",
                foreignField: "_id",
                as: "seat"
            }
        },
        { $unwind: "$seat" },
        {
            $lookup: {
                from: "carriages",
                localField: "seat.carriage_id",
                foreignField: "_id",
                as: "carriage"
            }
        },
        { $unwind: "$carriage" },
        {
            $group: {
                _id: "$carriage.seat_type",
                count: { $sum: 1 },
                revenue: { $sum: "$price" }
            }
        }
    ]);

    // 5. Recent Bookings
    const recentBookings = await BookingModel.find()
        .populate({
            path: "user_id",
            select: "name"
        })
        .populate({
            path: "schedule_id",
            populate: {
                path: "route_id",
                populate: [
                    { path: "departure_station_id", select: "station_name" },
                    { path: "arrival_station_id", select: "station_name" }
                ]
            }
        })
        .sort({ createdAt: -1 })
        .limit(5);

    // Format results for frontend
    const formattedRevenueByMonth = revenueByMonth.map(item => ({
        month: `T${item._id.month}`,
        revenue: item.revenue,
        tickets: item.tickets
    }));

    const formattedRevenueByRoute = revenueByRoute.map(item => ({
        name: item._id.name,
        value: item.value,
        revenue: item.revenue
    }));

    const formattedRevenueBySeatType = revenueBySeatType.map(item => ({
        type: item._id || "Chưa phân loại",
        count: item.count,
        revenue: item.revenue
    }));

    const formattedRecentBookings = recentBookings.map(b => {
        const booking = b as any;
        return {
            id: booking.booking_code,
            route: `${booking.schedule_id?.route_id?.departure_station_id?.station_name} → ${booking.schedule_id?.route_id?.arrival_station_id?.station_name}`,
            passenger: booking.user_id?.name || "Ẩn danh",
            date: new Date(booking.createdAt).toLocaleDateString("vi-VN"),
            status: booking.status === "paid" || booking.status === "confirmed" ? "confirmed" : booking.status === "pending" ? "pending" : "cancelled",
            amount: booking.price
        };
    });

    res.status(200).json({
        success: true,
        data: {
            stats: {
                revenueThisMonth: revenueThisMonth[0]?.total || 0,
                ticketsThisMonth,
                activeTrains,
                totalPassengers: totalPassengers.length
            },
            revenueByMonth: formattedRevenueByMonth,
            revenueByRoute: formattedRevenueByRoute,
            revenueBySeatType: formattedRevenueBySeatType,
            recentBookings: formattedRecentBookings
        }
    });
});
