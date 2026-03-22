import { apiClient } from "../config/api";

export interface Station {
  _id: string;
  station_name: string;
  station_code: string;
  station_order: number;
  station_type: "underground" | "elevated" | "ground";
  location: string;
  lat?: number;
  lng?: number;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function fetchStations() {
  const res = await apiClient.get("/stations");
  return res.data;
}

export async function createStation(data: Partial<Station>) {
  const res = await apiClient.post("/stations", data);
  return res.data;
}

export async function updateStation(id: string, data: Partial<Station>) {
  const res = await apiClient.put(`/stations/${id}`, data);
  return res.data;
}

export async function deleteStation(id: string) {
  const res = await apiClient.delete(`/stations/${id}`);
  return res.data;
}
