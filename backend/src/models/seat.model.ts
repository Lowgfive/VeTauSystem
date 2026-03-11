import mongoose, { Schema } from "mongoose";

export interface ISeat {
  schedule_id: mongoose.Types.ObjectId;

  carriage_id: mongoose.Types.ObjectId;

  seat_number: string;

  status: "available" | "booked";

  price: number;
}

const seatSchema = new Schema<ISeat>(
  {
    schedule_id: {
      type: Schema.Types.ObjectId,
      ref: "Schedule",
      required: true
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

    status: {
      type: String,
      enum: ["available", "booked"],
      default: "available"
    },

    price: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

export const Seat = mongoose.model<ISeat>("Seat", seatSchema);