import { apiClient } from "../config/api";

export async function createVNPayPayment(booking_ids: string[]): Promise<string> {
    const res = await apiClient.post("/payments/create-payment", { booking_ids });
    if (!res.data?.success) {
        throw new Error(res.data?.message || "Không thể tạo giao dịch VNPay");
    }
    return res.data.data.paymentUrl;
}
