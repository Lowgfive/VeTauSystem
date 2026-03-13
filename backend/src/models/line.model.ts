import mongoose, { Schema } from "mongoose";
import { ILine } from "../types/line.type";

const lineSchema = new Schema<ILine>(
    {
        line_name: { type: String, required: true, unique: true },
        line_code: { type: String, required: true, unique: true },
        stations: [{ type: Schema.Types.ObjectId, ref: "Station" }],
        total_distance: { type: Number, required: true },
        total_stations: { type: Number, required: true },
        is_active: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export const Line = mongoose.model<ILine>("Line", lineSchema);
