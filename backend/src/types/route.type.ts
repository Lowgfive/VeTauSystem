import { Types } from "mongoose";

export interface IRoute {
  departure_station_id: Types.ObjectId;
  arrival_station_id: Types.ObjectId;
  distance: number;
  hour: number;
}
