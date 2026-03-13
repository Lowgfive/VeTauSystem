import mongoose, { Schema, Document } from "mongoose";
import { SeatType } from "../types/carriage.type";

export interface ISeatTemplate extends Document {
  seat_number: string;
  type: SeatType;
  is_available: boolean;
}

const seatTemplateSchema = new Schema<ISeatTemplate>(
  {
    seat_number: { type: String, required: true },
    type: {
      type: String,
      enum: ["seat", "priority", "business", "economy"],
      default: "seat"
    },
    is_available: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const SeatTemplate = mongoose.model<ISeatTemplate>("SeatTemplate", seatTemplateSchema);
