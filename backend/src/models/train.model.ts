import mongoose, { Schema } from "mongoose";
import { ITrain } from "../types/train.type";

// Schema Train (Đoàn tàu)
// Mỗi document Train đại diện cho 1 đoàn tàu (VD: SE1, TN1...)
// Một Train sẽ chứa nhiều Carriage (toa xe) ở collection riêng

const trainSchema = new Schema<ITrain>(
    {
        // Tên đoàn tàu hiển thị
        train_name: { type: String, required: true },

        // Mã đoàn tàu duy nhất
        train_code: { type: String, required: true, unique: true },

        // Loại đoàn tàu
        train_type: { type: String, enum: ["4-car", "6-car", "8-car"] },

        // Tuyến đường sắt
        line_id: { type: Schema.Types.ObjectId, ref: "Line" },

        direction: { type: String, enum: ["forward", "backward"] },

        total_carriages: { type: Number },

        capacity: { type: Number },

        max_speed: { type: Number },

        amenities: { type: [String], default: [] },

        is_active: { type: Boolean, default: true },

        template_id: { type: Schema.Types.ObjectId, ref: "TrainTemplate" },

        status: { type: String, enum: ["active", "inactive"], default: "active" }

    },
    { timestamps: true }
);

export const Train = mongoose.model<ITrain>("Train", trainSchema);
