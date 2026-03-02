import mongoose, { Schema } from "mongoose"
import { IRoute } from "../types/route.type"

const routeSchema = new Schema<IRoute>(
  {
    departure_station_id: {
      type: Schema.Types.ObjectId,
      ref: "Station",
      required: true
    },
    arrival_station_id: {
      type: Schema.Types.ObjectId,
      ref: "Station",
      required: true
    },
    distance_km: { type: Number, required: true },
    estimated_time_hours: { type: Number, required: true }
  },
  { timestamps: true }
)

export const Route = mongoose.model<IRoute>("Route", routeSchema)