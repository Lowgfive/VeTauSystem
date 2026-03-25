import mongoose, { Schema, Document } from "mongoose";

export interface ITransaction extends Document {
    user_id: mongoose.Types.ObjectId;
    amount: number;
    type: "deposit" | "payment" | "refund" | "adjustment";
    description: string;
    booking_id?: mongoose.Types.ObjectId;
    status: "pending" | "completed" | "failed";
    payment_txn_ref?: string;
    createdAt: Date;
    updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        type: {
            type: String,
            enum: ["deposit", "payment", "refund", "adjustment"],
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        booking_id: {
            type: Schema.Types.ObjectId,
            ref: "Booking",
        },
        status: {
            type: String,
            enum: ["pending", "completed", "failed"],
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

const TransactionModel = mongoose.model<ITransaction>("Transaction", TransactionSchema);

export default TransactionModel;
