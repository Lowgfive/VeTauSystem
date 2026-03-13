import { Types, Document } from "mongoose";

// ─── Loại chỗ ngồi trên toa tàu ──────────────────────────────────────────────
export type SeatType =
    | "seat"       // Ghế ngồi thường
    | "priority"   // Ghế ưu tiên (người già, khuyết tật, phụ nữ mang thai)
    | "standing"   // Khu vực đứng
    | "business"   // Hạng thương gia
    | "economy";    // Hạng phổ thông (nếu phân tách với seat thường)

// ─── Layout mô tả cách bố trí ghế trong toa tàu ─────────────────────────────
export interface CarriageLayout {
    rows: number;   // Số hàng ghế
    cols: number;   // Số cột ghế (VD: 4 cho 2 bên x 2 ghế)
}

// ─── Interface chính cho Carriage (Toa xe) ───────────────────────────────────
export interface ICarriage extends Document {
    train_id: Types.ObjectId;     // Đoàn tàu mà toa này thuộc về
    carriage_number: number;      // Số thứ tự toa trong đoàn (1, 2, 3...)
    seat_type: SeatType;          // Loại chỗ chính của toa
    total_seats: number;          // Tổng số ghế ngồi trong toa
    standing_capacity: number;    // Sức chứa hành khách đứng
    layout: CarriageLayout;       // Cách bố trí ghế (rows x cols)
    is_active: boolean;           // Toa có đang sử dụng không
}
