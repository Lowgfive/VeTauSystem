import { apiClient } from "../config/api";
import { Station } from "../types";

export interface StationOption {
  id: string;
  name: string;
  code: string;
}

let stationCache: StationOption[] | null = null;
let stationRequest: Promise<StationOption[]> | null = null;

const mapStationToOption = (station: Station): StationOption => ({
  id: station._id,
  name: station.station_name,
  code: station.station_code,
});

export async function fetchStations(forceRefresh = false): Promise<StationOption[]> {
  if (!forceRefresh && stationCache) {
    return stationCache;
  }

  if (!forceRefresh && stationRequest) {
    return stationRequest;
  }

  stationRequest = apiClient
    .get("/stations")
    .then((res) => {
      const stations = Array.isArray(res.data?.data) ? res.data.data : [];
      stationCache = stations.map(mapStationToOption);
      return stationCache;
    })
    .finally(() => {
      stationRequest = null;
    });

  return stationRequest;
}
