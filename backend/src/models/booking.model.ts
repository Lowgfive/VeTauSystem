import mongoose, { Schema, Document } from "mongoose";

// ─── IBooking Interface ────────────────────────────────────────────────────────

export interface IBooking extends Document {
    user_id: mongoose.Types.ObjectId;
    schedule_id: mongoose.Types.ObjectId;
    total_amount: number;
    status: "pending" | "confirmed" | "cancelled" | "refunded" | "changed" | "paid";
    createdAt: Date;
    updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        schedule_id: {
            type: Schema.Types.ObjectId,
            ref: "Schedule",
            required: true,
        },
        total_amount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "confirmed", "cancelled", "refunded", "changed", "paid"],
            default: "pending",
        }
    },
    {
        timestamps: true,   // auto createdAt / updatedAt
        versionKey: false,  // remove __v field
    }
);

const BookingModel = mongoose.model<IBooking>("Booking", BookingSchema);

export default BookingModel;
