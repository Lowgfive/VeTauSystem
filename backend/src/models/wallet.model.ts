import mongoose, { Schema, Document } from "mongoose";

export interface IWallet extends Document {
  user_id: mongoose.Types.ObjectId;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema = new Schema<IWallet>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: [0, "Số dư không thể âm"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const WalletModel = mongoose.model<IWallet>("Wallet", WalletSchema);

export default WalletModel;
