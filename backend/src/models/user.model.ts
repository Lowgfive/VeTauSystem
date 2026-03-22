import mongoose, { Schema, Document } from "mongoose";
import { UserRole } from "../types/auth.type";

// ─── IUser Interface (Mongoose Document) ─────────────────────────────────────

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    phone?: string;
    cccd?: string;
    role: UserRole;
    isVerified: boolean;
    otp?: string;
    otpExpiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// ─── User Schema ──────────────────────────────────────────────────────────────

const UserSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, "Tên là bắt buộc"],
            trim: true,
            minlength: [2, "Tên tối thiểu 2 ký tự"],
        },
        email: {
            type: String,
            required: [true, "Email là bắt buộc"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        // select: false → password is excluded from query results by default.
        // Use .select("+password") only when you need to compare it (login flow).
        password: {
            type: String,
            required: [true, "Mật khẩu là bắt buộc"],
            minlength: [6, "Mật khẩu tối thiểu 6 ký tự"],
            select: false,
        },
        phone: {
            type: String,
            trim: true,
        },
        cccd: {
            type: String,
            trim: true,
        },
        role: {
            type: String,
            enum: Object.values(UserRole),
            default: UserRole.USER,
        },
        isVerified: {
            type: Boolean,
            default: true,
        },
        otp: {
            type: String,
            select: false,
        },
        otpExpiresAt: {
            type: Date,
            select: false,
        },
    },
    {
        timestamps: true,   // auto createdAt / updatedAt
        versionKey: false,  // remove __v field
    }
);

const UserModel = mongoose.model<IUser>("User", UserSchema);

export default UserModel;
