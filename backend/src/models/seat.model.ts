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
  position?: SeatPosition;
  price?: number;
  locked_at?: Date;
  expired_at?: Date;
  locked_by?: mongoose.Types.ObjectId;
}

const seatSchema = new Schema<ISeat>(
  {
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
      required: false
    },
    locked_at: { type: Date },
    expired_at: { type: Date },
    locked_by: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

export const Seat = mongoose.model<ISeat>("Seat", seatSchema);