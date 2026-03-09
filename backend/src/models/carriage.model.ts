import mongoose, { Schema } from "mongoose";
import { ICarriage } from "../types/carriage.type";

// ─── Schema Carriage (Toa xe Metro) ──────────────────────────────────────────
// Mỗi document Carriage là 1 toa thuộc 1 đoàn tàu metro cụ thể
// Khi admin tạo 1 đoàn tàu mới, service sẽ auto-generate các toa + ghế

const carriageSchema = new Schema<ICarriage>(
    {
        // Liên kết toa này thuộc đoàn tàu nào
        train_id: {
            type: Schema.Types.ObjectId,
            ref: "Train",
            required: true,
        },

        // Số thứ tự toa trong đoàn (1, 2, 3...)
        carriage_number: { type: Number, required: true },

        // Loại chỗ chính: seat (thường) / priority (ưu tiên) / standing
        seat_type: {
            type: String,
            enum: ["seat", "priority", "standing"],
            default: "seat",
            required: true,
        },

        // Tổng số ghế ngồi trong toa
        total_seats: { type: Number, required: true },

        // Sức chứa hành khách đứng
        standing_capacity: { type: Number, default: 200 },

        // Bố trí ghế dạng lưới: rows x cols
        // VD: 11 hàng x 4 cột = 44 ghế
        layout: {
            rows: { type: Number, required: true },
            cols: { type: Number, required: true },
        },

        // Toa có đang sử dụng không
        is_active: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// Index giúp truy vấn nhanh các toa của 1 đoàn tàu
carriageSchema.index({ train_id: 1, carriage_number: 1 }, { unique: true });

export const Carriage = mongoose.model<ICarriage>("Carriage", carriageSchema);
