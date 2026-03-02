import { apiClient } from "../config/api";

export async function fetchSchedules(params: {
  fromStation: string;
  toStation: string;
  date: string;
}) {
  const res = await apiClient.get("/schedules", { params });
  return res.data;
}

export async function fetchCarriages(scheduleId: string) {
  const res = await apiClient.get(`/schedules/${scheduleId}/carriages`);
  return res.data;
}

export async function fetchSeats(scheduleId: string, carriageId: string) {
  const res = await apiClient.get(`/schedules/${scheduleId}/seats`, {
    params: { carriageId },
  });
  return res.data;
}


