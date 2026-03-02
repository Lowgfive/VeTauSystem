import { Types } from "mongoose";

export interface IRoute {
  departure_station_id: Types.ObjectId;
  arrival_station_id: Types.ObjectId;
  distance_km: number;
  estimated_time_hours: number;
}


