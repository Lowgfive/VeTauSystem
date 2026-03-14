import mongoose, { Schema, Document } from "mongoose";
import { SeatType, CarriageLayout } from "../types/carriage.type";

export interface ICarriageTemplate extends Document {
    name: string;
    seat_type: SeatType;
    total_seats: number;
    standing_capacity: number;
    layout: CarriageLayout;
    description?: string;
}

const carriageTemplateSchema = new Schema<ICarriageTemplate>(
    {
        name: { type: String, required: true, unique: true },
        seat_type: {
            type: String,
            enum: ["seat", "priority", "standing", "business", "economy"],
            required: true
        },
        total_seats: { type: Number, required: true },
        standing_capacity: { type: Number, default: 0 },
        layout: {
            rows: { type: Number, required: true },
            cols: { type: Number, required: true },
        },
        description: { type: String }
    },
    { timestamps: true }
);

export const CarriageTemplate = mongoose.model<ICarriageTemplate>(
    "CarriageTemplate",
    carriageTemplateSchema
);
