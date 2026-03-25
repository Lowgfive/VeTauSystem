import BookingModel from "../models/booking.model";
import TransactionModel from "../models/transaction.model";
import { Train } from "../models/train.model";
import UserModel from "../models/user.model";
import { Seat } from "../models/seat.model";
import { Schedule } from "../models/schedule.model";

export class DashboardService {
    static async getOverviewStats() {
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // 1. Doanh thu tháng này
        const revenueResult = await TransactionModel.aggregate([
            {
                $match: {
                    status: "completed",
                    type: "payment",
                    createdAt: { $gte: firstDayOfMonth },
                },
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$amount" },
                },
            },
        ]);
        const revenueThisMonth = revenueResult[0]?.totalRevenue || 0;

        // 2. Vé đã bán (tổng tất cả booking confirmed/paid)
        const ticketsSold = await BookingModel.countDocuments({
            status: { $in: ["confirmed", "paid"] },
        });

        // 3. Tàu đang hoạt động
        const activeTrains = await Train.countDocuments({ status: "active", is_active: true });

        // 4. Tổng số hành khách (Users)
        const totalPassengers = await UserModel.countDocuments({ role: "user" });

        // 5. Tỷ lệ lấp đầy = số booking confirmed+paid / tổng booking * 100
        const totalBookings = await BookingModel.countDocuments();
        const confirmedBookings = await BookingModel.countDocuments({
            status: { $in: ["confirmed", "paid"] },
        });
        const occupancyRate = totalBookings > 0
            ? ((confirmedBookings / totalBookings) * 100).toFixed(1)
            : "0.0";

        return {
            revenueThisMonth,
            ticketsSold,
            activeTrains,
            totalPassengers,
            occupancyRate: `${occupancyRate}%`,
        };
    }

    static async getRevenueChart(months: number = 6) {
        const today = new Date();
        const pastDate = new Date(today.getFullYear(), today.getMonth() - months + 1, 1);

        const result = await TransactionModel.aggregate([
            {
                $match: {
                    status: "completed",
                    type: "payment",
                    createdAt: { $gte: pastDate },
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                    },
                    revenue: { $sum: "$amount" },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 },
            },
        ]);

        return result.map((item) => ({
            month: `T${item._id.month}`,
            revenue: item.revenue,
            tickets: item.count,
        }));
    }

    static async getRecentBookings() {
        // Booking → Schedule → Route → Stations
        const bookings = await BookingModel.aggregate([
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "schedules",
                    localField: "schedule_id",
                    foreignField: "_id",
                    as: "schedule"
                }
            },
            { $unwind: { path: "$schedule", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "stations",
                    localField: "departure_station_id",
                    foreignField: "_id",
                    as: "depStation"
                }
            },
            { $unwind: { path: "$depStation", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "stations",
                    localField: "arrival_station_id",
                    foreignField: "_id",
                    as: "arrStation"
                }
            },
            { $unwind: { path: "$arrStation", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    booking_code: 1,
                    total_amount: 1,
                    status: 1,
                    createdAt: 1,
                    passengerName: "$user.name",
                    depStationName: "$depStation.station_name",
                    arrStationName: "$arrStation.station_name"
                }
            }
        ]);

        return bookings.map((b: any) => ({
            id: b.booking_code || b._id.toString(),
            route: b.depStationName && b.arrStationName
                ? `${b.depStationName} → ${b.arrStationName}`
                : "N/A",
            passenger: b.passengerName || "Khách Vãng Lai",
            date: new Date(b.createdAt).toLocaleDateString("vi-VN"),
            status: b.status,
            amount: b.total_amount,
        }));
    }

    static async getRouteDistribution() {
        // Booking → departure_station + arrival_station → Tạo label "Ga A → Ga B"
        const result = await BookingModel.aggregate([
            {
                $match: { status: { $in: ["confirmed", "paid"] } }
            },
            {
                $lookup: {
                    from: "stations",
                    localField: "departure_station_id",
                    foreignField: "_id",
                    as: "depStation"
                }
            },
            { $unwind: { path: "$depStation", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "stations",
                    localField: "arrival_station_id",
                    foreignField: "_id",
                    as: "arrStation"
                }
            },
            { $unwind: { path: "$arrStation", preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: {
                        dep: "$depStation.station_name",
                        arr: "$arrStation.station_name"
                    },
                    value: { $sum: 1 },
                    revenue: { $sum: "$total_amount" }
                }
            },
            {
                $project: {
                    _id: 0,
                    name: {
                        $concat: [
                            { $ifNull: ["$_id.dep", "?"] },
                            " → ",
                            { $ifNull: ["$_id.arr", "?"] }
                        ]
                    },
                    value: 1,
                    revenue: 1
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: 10 }
        ]);
        return result;
    }

    static async getSeatTypeRevenue() {
        const result = await Seat.aggregate([
            {
                $match: { status: "booked" }
            },
            {
                $group: {
                    _id: "$seat_type",
                    count: { $sum: 1 },
                    revenue: { $sum: "$price" }
                }
            },
            {
                $project: {
                    _id: 0,
                    type: "$_id",
                    count: 1,
                    revenue: 1
                }
            }
        ]);

        const typeMapping: Record<string, string> = {
            "hard_seat": "Ngồi cứng",
            "soft_seat": "Ngồi mềm",
            "sleeper_6": "Nằm khoang 6",
            "sleeper_4": "Nằm khoang 4",
            "vip_sleeper_2": "Nằm VIP 2",
            "seat": "Ghế ngồi",
            "priority": "Khác"
        };

        return result.map(r => ({
            type: typeMapping[r.type] || r.type || "Chưa phân loại",
            count: r.count,
            revenue: r.revenue || 0
        }));
    }
}
