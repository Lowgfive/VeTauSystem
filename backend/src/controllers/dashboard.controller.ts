import { Request, Response } from "express";
import { DashboardService } from "../services/dashboard.service";

export class DashboardController {
    static async getStats(req: Request, res: Response) {
        try {
            const stats = await DashboardService.getOverviewStats();
            const revenueChart = await DashboardService.getRevenueChart();
            const recentBookings = await DashboardService.getRecentBookings();
            const routeDistribution = await DashboardService.getRouteDistribution();
            const seatTypeRevenue = await DashboardService.getSeatTypeRevenue();

            res.status(200).json({
                success: true,
                data: {
                    stats,
                    revenueChart,
                    recentBookings,
                    routeDistribution,
                    seatTypeRevenue,
                },
            });
        } catch (error: any) {
            console.error("[DashboardController Error]", error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
}
