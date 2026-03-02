import mongoose, { Schema } from "mongoose";
import { IStation } from "../types/station.type";

const stationSchema = new Schema<IStation>(
  {
    name: { type: String, required: true },
    city: { type: String, required: true },
    province: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Station = mongoose.model<IStation>("Station", stationSchema);


