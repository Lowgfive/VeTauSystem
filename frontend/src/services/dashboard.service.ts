import { apiClient } from "../config/api";

export interface DashboardData {
    stats: {
        revenueThisMonth: number;
        ticketsSold: number;
        activeTrains: number;
        totalPassengers: number;
        occupancyRate: string;
    };
    revenueChart: Array<{ month: string; revenue: number; tickets: number }>;
    recentBookings: Array<{ id: string; route: string; passenger: string; date: string; status: string; amount: number }>;
    routeDistribution: Array<{ name: string; value: number; revenue: number }>;
    seatTypeRevenue: Array<{ type: string; count: number; revenue: number }>;
}

export async function fetchDashboardData(): Promise<DashboardData> {
    const response = await apiClient.get('/dashboard/stats');
    return response.data.data;
}
