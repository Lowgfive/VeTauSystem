import mongoose, { Schema, Document } from "mongoose";

export interface IPassenger extends Document {
    full_name: string;
    id_number: string;
    dob?: Date;
    gender?: string;
    createdAt: Date;
    updatedAt: Date;
}

const PassengerSchema = new Schema<IPassenger>(
    {
        full_name: { type: String, required: true },
        id_number: { type: String, required: true, unique: true },
        dob: { type: Date, required: false },
        gender: { type: String, enum: ["Male", "Female", "Other", "Unknown"], default: "Unknown" }
    },
    { timestamps: true, versionKey: false }
);

export const Passenger = mongoose.model<IPassenger>("Passenger", PassengerSchema);
