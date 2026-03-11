import mongoose, { Schema } from "mongoose";
import { IStation } from "../types/station.type";

// Schema Station (Nhà ga Metro)
// Mỗi document Station là 1 nhà ga trên tuyến Metro

const stationSchema = new Schema<IStation>(
  {
    // Tên ga hiển thị (VD: "Quần Ngựa", "Kim Mã"...)
    station_name: {
      type: String,
      unique: true,
      required: true,
    },

    // Mã ga duy nhất (VD: "L5-01", "L5-02"...)
    station_code: {
      type: String,
      unique: true,
      required: true,
    },

    // Thứ tự ga trên tuyến (1-20)
    station_order: {
      type: Number,
      required: true,
    },

    // Tọa độ GPS (optional)
    lat: { type: Number },
    lng: { type: Number },

    // Ga có đang hoạt động không
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Index theo tuyến + thứ tự ga
stationSchema.index({ line_id: 1, station_order: 1 }, { unique: true });

export const Station = mongoose.model<IStation>("Station", stationSchema);
