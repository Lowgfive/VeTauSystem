import mongoose, { Schema, Document } from "mongoose";

export enum TransactionType {
  DEPOSIT = "deposit",
  PAYMENT = "payment",
  REFUND = "refund",
}

export enum TransactionStatus {
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
}

export interface IWalletTransaction extends Document {
  wallet_id: mongoose.Types.ObjectId;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  booking_id?: mongoose.Types.ObjectId;
  vnpay_txn_ref?: string; // For tracking VNPay top-ups
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WalletTransactionSchema = new Schema<IWalletTransaction>(
  {
    wallet_id: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.PENDING,
    },
    booking_id: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
    },
    vnpay_txn_ref: {
      type: String,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const WalletTransactionModel = mongoose.model<IWalletTransaction>(
  "WalletTransaction",
  WalletTransactionSchema
);

export default WalletTransactionModel;
