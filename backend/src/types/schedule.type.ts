import { Types } from "mongoose";

export interface ISchedule {
  route_id: Types.ObjectId;
  train_id: Types.ObjectId;
  date: Date;
  departure_time: string;
  arrival_time: string;
}
