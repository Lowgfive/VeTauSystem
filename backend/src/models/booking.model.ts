import mongoose, { Schema, Document } from "mongoose";

export interface IBooking extends Document {
    user_id: mongoose.Types.ObjectId;
    schedule_id: mongoose.Types.ObjectId;
    booking_code?: string;
    total_amount: number;
    status: "pending" | "confirmed" | "cancelled" | "refunded" | "changed" | "paid";
    payment_txn_ref?: string;
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
        booking_code: {
            type: String,
            unique: true,
            sparse: true,
        },
        total_amount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "confirmed", "cancelled", "refunded", "changed", "paid"],
            default: "pending",
        },
        payment_txn_ref: {
            type: String,
            index: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const BookingModel = mongoose.model<IBooking>("Booking", BookingSchema);

export default BookingModel;
