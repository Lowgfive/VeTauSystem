import mongoose, { Schema } from "mongoose";
import { SeatStatus, SeatPosition } from "../types/seat.type";
import { SeatType } from "../types/carriage.type";

// Interface cho Seat model - kết hợp cả booking và template seat
export interface ISeat {
  schedule_id?: mongoose.Types.ObjectId; // Optional - chỉ có khi ghế được gán cho schedule cụ thể
  carriage_id: mongoose.Types.ObjectId;
  seat_number: string;
  seat_type?: SeatType; // Loại ghế (hard_seat, soft_seat, etc.)
  status: SeatStatus;
  position?: SeatPosition; // Vị trí ghế trong toa (row, col)
  price?: number; // Giá vé - chỉ có khi ghế được gán cho schedule
}

const seatSchema = new Schema<ISeat>(
  {
    schedule_id: {
      type: Schema.Types.ObjectId,
      ref: "Schedule",
      required: false // Không bắt buộc - ghế có thể tồn tại mà chưa gán schedule
    },
    carriage_id: {
      type: Schema.Types.ObjectId,
      ref: "Carriage",
      required: true
    },
    seat_number: {
      type: String,
      required: true
    },
    seat_type: {
      type: String,
      enum: ["hard_seat", "soft_seat", "sleeper_6", "sleeper_4", "vip_sleeper_2", "seat", "priority"],
      required: false
    },
    status: {
      type: String,
      enum: ["available", "booked", "locked", "maintenance"],
      default: "available"
    },
    position: {
      row: { type: Number },
      col: { type: Number }
    },
    price: {
      type: Number,
      required: false // Không bắt buộc - giá có thể được tính từ schedule
    }
  },
  { timestamps: true }
);

export const Seat = mongoose.model<ISeat>("Seat", seatSchema);