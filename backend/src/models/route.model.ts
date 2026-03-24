import mongoose, { Schema } from "mongoose";
import { IRoute } from "../types/route.type";

const routeSchema = new Schema<IRoute>(
  {
    departure_station_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Station",
      required: true,
    },
    arrival_station_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Station",
      required: true,
    },
    distance: { type: Number, required: true },
    hour: { type: Number, required: true },
    base_price: { type: Number, required: false },
  },
  { timestamps: true }
);

export const Route = mongoose.model<IRoute>("Route", routeSchema);
