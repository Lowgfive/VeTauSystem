import mongoose, { Schema } from "mongoose";
import { ISeat } from "../types/seat.type";

// ─── Schema Seat (Ghế trên toa Metro) ────────────────────────────────────────
// Mỗi document Seat là 1 chỗ ngồi cụ thể trong 1 toa metro
// Ghế được auto-generate khi admin tạo toa, không cần nhập tay

const seatSchema = new Schema<ISeat>(
    {
        // Liên kết ghế này thuộc toa nào
        carriage_id: {
            type: Schema.Types.ObjectId,
            ref: "Carriage",
            required: true,
        },

        // Mã ghế hiển thị cho user (VD: "1A3" = toa 1, cột A, hàng 3)
        seat_number: { type: String, required: true },

        // Loại ghế: seat (thường) / priority (ưu tiên) / standing
        seat_type: {
            type: String,
            enum: ["seat", "priority", "standing"],
            required: true,
        },

        // Trạng thái ghế hiện tại
        // available    = còn trống
        // booked       = đã bán
        // locked       = đang giữ chỗ (chờ thanh toán)
        // maintenance  = hỏng / bảo trì
        status: {
            type: String,
            enum: ["available", "booked", "locked", "maintenance"],
            default: "available",
        },

        // Tọa độ ghế trên sơ đồ (dùng để render UI)
        position: {
            row: { type: Number, required: true },
            col: { type: Number, required: true },
        },
    },
    { timestamps: true }
);

// Index giúp truy vấn nhanh tất cả ghế trong 1 toa
seatSchema.index({ carriage_id: 1 });

// Index để đảm bảo không trùng mã ghế trong cùng 1 toa
seatSchema.index({ carriage_id: 1, seat_number: 1 }, { unique: true });

export const Seat = mongoose.model<ISeat>("Seat", seatSchema);
