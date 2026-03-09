import mongoose, { Schema } from "mongoose";
import { ITrain } from "../types/train.type";

const trainSchema = new Schema<ITrain>(
    {
        train_name: { type: String, required: true },
        train_code: { type: String, required: true, unique: true },
        status : {type : String, enum : ["active", "inactive"], default : "active"} 
    },
    { timestamps: true }
);

export const Train = mongoose.model<ITrain>("Train", trainSchema);
