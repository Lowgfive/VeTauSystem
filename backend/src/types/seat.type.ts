import { Types, Document } from "mongoose";
import { SeatType } from "./carriage.type";

// Trạng thái ghế
export type SeatStatus = "available" | "booked" | "locked" | "maintenance";
// available    = Còn trống, có thể đặt
// booked       = Đã có người mua vé
// locked       = Đang bị giữ chỗ tạm thời (chờ thanh toán)
// maintenance  = Ghế hỏng / đang bảo trì, không bán

// Vị trí ghế trong toa
export interface SeatPosition {
    row: number;  // Hàng
    col: number;  // Cột
}

// Interface chính cho Seat (Ghế trên toa tàu)
export interface ISeat extends Document {
    carriage_id: Types.ObjectId;  // Toa xe chứa ghế này
    seat_number: string;          // Mã ghế hiển thị (VD: "1A3")
    seat_type: SeatType;          // Loại ghế: seat / priority 
    status: SeatStatus;           // Trạng thái hiện tại của ghế
    position: SeatPosition;       // Tọa độ ghế trên sơ đồ
}
