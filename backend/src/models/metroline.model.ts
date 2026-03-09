import mongoose, { Schema } from "mongoose";
import { IMetroLine } from "../types/metroline.type";

// Schema MetroLine (Tuyến Metro)
// Mỗi document MetroLine đại diện cho 1 tuyến metro (VD: Tuyến 5 Văn Cao – Hòa Lạc)

const metroLineSchema = new Schema<IMetroLine>(
    {
        // Tên tuyến đầy đủ
        line_name: { type: String, required: true },

        // Mã tuyến ngắn gọn (VD: "L5")
        line_code: { type: String, required: true, unique: true },

        // Danh sách ga theo thứ tự (mảng ObjectId → Station)
        stations: [
            {
                type: Schema.Types.ObjectId,
                ref: "Station",
            },
        ],

        // Tổng chiều dài tuyến (km)
        total_distance: { type: Number, required: true },

        // Tổng số ga
        total_stations: { type: Number, required: true },

        // Giờ hoạt động
        operating_hours: {
            start: { type: String, default: "05:30" },
            end: { type: String, default: "23:00" },
        },

        // Tần suất chạy (phút/chuyến)
        frequency_minutes: { type: Number, default: 5 },

        // Tuyến có đang hoạt động không
        is_active: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export const MetroLine = mongoose.model<IMetroLine>("MetroLine", metroLineSchema);
