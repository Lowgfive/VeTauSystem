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
    trainId: string;
    depOrder?: number;
    arrOrder?: number;
    seats: SeatInfo[];
    carriages?: any[];
  };
}

export const seatService = {
  /**
   * Fetch seats for a specific schedule
   */
  getSeatsBySchedule: async (
    scheduleId: string,
    departureStationId?: string,
    arrivalStationId?: string
  ): Promise<SeatMapResponse> => {
    const response = await apiClient.get(`/schedules/${scheduleId}/seats`, {
      params: {
        ...(departureStationId && { departureStationId }),
        ...(arrivalStationId && { arrivalStationId }),
      },
    });
    return response.data;
  },

  /**
   * Lock a seat for a specific schedule
   */
  lockSeat: async (scheduleId: string, seatId: string, departureStationId: string, arrivalStationId: string) => {
    const response = await apiClient.post("/seats/lock", { scheduleId, seatId, departureStationId, arrivalStationId });
    return response.data;
  },

  /**
   * Unlock a seat for a specific schedule
   */
  unlockSeat: async (scheduleId: string, seatId: string) => {
    const response = await apiClient.post("/seats/unlock", { scheduleId, seatId });
    return response.data;
  },

  /**
   * Bulk unlock seats for a specific schedule
   */
  unlockBatch: async (scheduleId: string, seatIds: string[]) => {
    const response = await apiClient.post("/seats/unlock-batch", { scheduleId, seatIds });
    return response.data;
  },
};
