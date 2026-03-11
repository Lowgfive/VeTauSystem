import mongoose, { Schema, Document } from "mongoose";

// ─── IBooking Interface ────────────────────────────────────────────────────────

export interface IBooking extends Document {
    user_id: mongoose.Types.ObjectId;
    schedule_id: mongoose.Types.ObjectId;
    seat_id: mongoose.Types.ObjectId;
    status: "confirmed" | "refunded" | "changed";
    booking_code: string;
    price: number;
    createdAt: Date;
    updatedAt: Date;
}

// ─── Booking Schema ────────────────────────────────────────────────────────────

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
        seat_id: {
            type: Schema.Types.ObjectId,
            ref: "Seat",
            required: true,
        },
        status: {
            type: String,
            enum: ["confirmed", "refunded", "changed"],
            default: "confirmed",
        },
        booking_code: {
            type: String,
            required: true,
            unique: true,
        },
        price: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,   // auto createdAt / updatedAt
        versionKey: false,  // remove __v field
    }
);

const BookingModel = mongoose.model<IBooking>("Booking", BookingSchema);

export default BookingModel;
