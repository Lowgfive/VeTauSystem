import mongoose, { Schema, Document } from "mongoose";
import { UserRole } from "../types/auth.type";

// ─── IUser Interface (Mongoose Document) ─────────────────────────────────────

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: UserRole;
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
        role: {
            type: String,
            enum: Object.values(UserRole),
            default: UserRole.USER,
        },
    },
    {
        timestamps: true,   // auto createdAt / updatedAt
        versionKey: false,  // remove __v field
    }
);

const UserModel = mongoose.model<IUser>("User", UserSchema);

export default UserModel;
