import { apiClient } from "../config/api";

export async function lockSeat(payload: {
  scheduleId: string;
  seatId: string;
  sessionId: string;
}) {
  const res = await apiClient.post("/booking/lock-seat", payload);
  return res.data;
}

export async function unlockSeat(payload: {
  scheduleId: string;
  seatId: string;
  sessionId: string;
}) {
  const res = await apiClient.post("/booking/unlock-seat", payload);
  return res.data;
}

export async function createBooking(payload: any) {
  const res = await apiClient.post("/booking/create", payload);
  return res.data;
}

export async function lookupBooking(params: { bookingCode: string; email: string }) {
  const res = await apiClient.get("/booking/lookup", { params });
  return res.data;
}

export async function requestRefund(payload: { bookingId: string; seats?: string[] }) {
  const res = await apiClient.post("/booking/refund", payload);
  return res.data;
}


