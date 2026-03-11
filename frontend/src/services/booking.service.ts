import { apiClient } from "../config/api";

export async function lockSeat(payload: {
  scheduleId: string;
  seatId: string;
  sessionId: string;
}) {
  const res = await apiClient.post("/bookings/lock-seat", payload);
  return res.data;
}

export async function unlockSeat(payload: {
  scheduleId: string;
  seatId: string;
  sessionId: string;
}) {
  const res = await apiClient.post("/bookings/unlock-seat", payload);
  return res.data;
}

export async function createBooking(payload: any) {
  const res = await apiClient.post("/bookings/create", payload);
  return res.data;
}

export async function lookupBooking(params: { bookingCode: string; email: string }) {
  const res = await apiClient.get("/bookings/lookup", { params });
  return res.data;
}

export async function requestRefund(payload: { bookingId: string; seats?: string[] }) {
  const res = await apiClient.post("/bookings/refund", payload);
  return res.data;
}

export async function getMyBookings() {
  const res = await apiClient.get("/bookings/my-bookings");
  return res.data;
}

export async function cancelBooking(bookingId: string) {
  const res = await apiClient.post(`/bookings/refund/${bookingId}`);
  return res.data;
}

export async function changeBookingSchedule(bookingId: string, payload: { new_schedule_id: string; new_seat_id: string }) {
  const res = await apiClient.post(`/bookings/change-schedule/${bookingId}`, payload);
  return res.data;
}

