import { apiClient } from "../config/api";

export async function generatePaymentUrl(bookingId: string) {
    const res = await apiClient.post("/payment/generate-url", { bookingId });
    return res.data;
}


