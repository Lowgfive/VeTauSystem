import { apiClient } from "../config/api";

export interface SeatInfo {
  seatNumber: string;
  seatId: string;
  carriageId: string;
  seatType: string;
  status: "available" | "booked" | "locked";
  expiresAt?: number;
}

export interface SeatMapResponse {
  success: boolean;
  data: {
    scheduleId: string;
    seats: SeatInfo[];
  };
}

export const seatService = {
  /**
   * Fetch seats for a specific schedule
   */
  getSeatsBySchedule: async (scheduleId: string): Promise<SeatMapResponse> => {
    const response = await apiClient.get(`/schedules/${scheduleId}/seats`);
    return response.data;
  },

  /**
   * Lock a seat for a specific schedule
   */
  lockSeat: async (scheduleId: string, seatNumber: string, departureStationId: string, arrivalStationId: string) => {
    const response = await apiClient.post("/seats/lock", { scheduleId, seatNumber, departureStationId, arrivalStationId });
    return response.data;
  },

  /**
   * Unlock a seat for a specific schedule
   */
  unlockSeat: async (scheduleId: string, seatNumber: string) => {
    const response = await apiClient.post("/seats/unlock", { scheduleId, seatNumber });
    return response.data;
  },

  /**
   * Bulk unlock seats for a specific schedule
   */
  unlockBatch: async (scheduleId: string, seatNumbers: string[]) => {
    const response = await apiClient.post("/seats/unlock-batch", { scheduleId, seatNumbers });
    return response.data;
  },
};
