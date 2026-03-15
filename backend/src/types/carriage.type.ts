import { Types, Document } from "mongoose";

// ─── Loại chỗ ngồi trên toa tàu ──────────────────────────────────────────────
export type SeatType =
    | "hard_seat"     // Ghế cứng
    | "soft_seat"     // Ghế mềm
    | "sleeper_6"     // Giường nằm khoang 6
    | "sleeper_4"     // Giường nằm khoang 4
    | "vip_sleeper_2"; // Giường VIP khoang 2

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
