import { apiClient } from "../config/api";

export const walletService = {
  getWallet: async () => {
    const response = await apiClient.get("/wallet/my-wallet");
    return response.data;
  },

  topUp: async (amount: number) => {
    const response = await apiClient.post("/wallet/top-up", { amount });
    return response.data;
  },

  payWithWallet: async (booking_id: string) => {
    const response = await apiClient.post("/wallet/pay", { booking_id });
    return response.data;
  },

  getAllTransactions: async (params: any) => {
    const response = await apiClient.get("/wallet/admin/transactions", { params });
    return response.data;
  },

  getAdminStats: async () => {
    const response = await apiClient.get("/wallet/admin/stats");
    return response.data;
  },
};
