import mongoose, { Schema } from "mongoose";
import { IMetroLine } from "../types/metroline.type";

const metroLineSchema = new Schema<IMetroLine>(
    {
        line_name: { type: String, required: true, unique: true },
        line_code: { type: String, required: true, unique: true },
        stations: [{ type: Schema.Types.ObjectId, ref: "Station" }],
        total_distance: { type: Number, required: true },
        total_stations: { type: Number, required: true },
        operating_hours: {
            start: { type: String, required: true },
            end: { type: String, required: true },
        },
        frequency_minutes: { type: Number, required: true },
        is_active: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export const MetroLine = mongoose.model<IMetroLine>("MetroLine", metroLineSchema);
