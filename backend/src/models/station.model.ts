import mongoose, { Schema } from "mongoose";
import { IStation } from "../types/station.type";

// Schema Station (Nhà ga Metro)
// Mỗi document Station là 1 nhà ga trên tuyến Metro

const stationSchema = new Schema<IStation>(
  {

    station_name: {
      type: String,
      unique: true,
      required: true,
    },
    location : {
      type : String,
      required : true
    },

    station_order: {
      type: Number,
      required: true,
    },

    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Index theo tuyến + thứ tự ga
stationSchema.index({ line_id: 1, station_order: 1 }, { unique: true });

export const Station = mongoose.model<IStation>("Station", stationSchema);
