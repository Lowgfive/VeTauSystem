import mongoose, { Schema } from "mongoose";
import { IStation } from "../types/station.type";

// Schema Station (Nhà ga)
// Mỗi document Station là 1 nhà ga trên một tuyến đường sắt

const stationSchema = new Schema<IStation>(
  {
    station_name: {
      type: String,
      unique: true,
      required: true,
    },
    station_code: {
      type: String,
      unique: true,
      required: true,
    },
    station_type: {
      type: String,
      enum: ["underground", "elevated", "ground"],
      default: "ground",
    },
    location: {
      type: String,
      required: true
    },
    lat: { type: Number },
    lng: { type: Number },
    station_order: {
      type: Number,
      required: true,
    },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Index theo thứ tự ga (không unique vì ga có thể dùng chung thứ tự trên các tuyến khác nhau)
stationSchema.index({ station_order: 1 });

export const Station = mongoose.model<IStation>("Station", stationSchema);
