import mongoose, { Schema } from "mongoose";
import { ITrain } from "../types/train.type";

// Schema Train (Đoàn tàu Metro)
// Mỗi document Train đại diện cho 1 đoàn tàu metro (VD: M5-001, M5-002...)
// Một Train sẽ chứa nhiều Carriage (toa xe) ở collection riêng

const trainSchema = new Schema<ITrain>(
    {
        // Tên đoàn tàu hiển thị
        train_name: { type: String, required: true },

        direction : {type : String, enum : ["forward", "backward"]},

        status : {type : String, enum : ["active", "inactive"], default : "active"} 

    },
    { timestamps: true }
);

export const Train = mongoose.model<ITrain>("Train", trainSchema);
