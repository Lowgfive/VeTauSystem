import mongoose, { Schema } from "mongoose";
import { ITrain } from "../types/train.type";

// Schema Train (Đoàn tàu Metro)
// Mỗi document Train đại diện cho 1 đoàn tàu metro (VD: M5-001, M5-002...)
// Một Train sẽ chứa nhiều Carriage (toa xe) ở collection riêng

const trainSchema = new Schema<ITrain>(
    {
        // Tên đoàn tàu hiển thị
        train_name: { type: String, required: true },

        // Mã tàu duy nhất (VD: "M5-001")
        train_code: { type: String, required: true, unique: true },


        // Loại đoàn tàu: 4 toa / 6 toa / 8 toa
        train_type: {
            type: String,
            enum: ["4-car", "6-car", "8-car"],
            default: "4-car",
        },

        // Thuộc tuyến Metro nào
        line_id: {
            type: Schema.Types.ObjectId,
            ref: "MetroLine",
            required: true,
        },

        // Tổng số toa trong đoàn tàu
        total_carriages: { type: Number, required: true },

        // Sức chứa tối đa (ngồi + đứng)
        capacity: { type: Number, required: true },

        // Tốc độ tối đa (km/h)
        max_speed: { type: Number, default: 120 },

        // Danh sách tiện ích trên tàu
        amenities: {
            type: [String],
            default: ["air-conditioning", "wifi"],
        },

        // Tàu có đang hoạt động không
        is_active: { type: Boolean, default: true },

        status : {type : String, enum : ["active", "inactive"], default : "active"} 

    },
    { timestamps: true }
);

export const Train = mongoose.model<ITrain>("Train", trainSchema);
