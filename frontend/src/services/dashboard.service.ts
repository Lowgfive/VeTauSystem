import { apiClient } from "../config/api";

export async function getDashboardStats() {
    const res = await apiClient.get("/dashboard/stats");
    return res.data;
}
