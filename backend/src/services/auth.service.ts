import bcrypt from "bcrypt";
import UserModel from "../models/user.model";
import { signAccessToken } from "../utils/jwt";
import type { RegisterInput, LoginInput, ForgotPasswordInput, ResetPasswordInput } from "../schemas/auth.schema";
import type { UserResponse, LoginResponse, RegisterResponse } from "../types/auth.type";
import { sendResetPasswordEmail, sendPasswordChangedEmail } from "./emailService";
import { signResetPasswordToken, verifyResetPasswordToken } from "../utils/jwt";

// ─── Constants ────────────────────────────────────────────────────────────────

const SALT_ROUNDS = 10;

// ─── Helper: map Mongoose doc → UserResponse (no password) ───────────────────

const toUserResponse = (user: InstanceType<typeof UserModel>): UserResponse => ({
    _id: (user._id as unknown as string).toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});

// ─── Register ─────────────────────────────────────────────────────────────────

export const registerService = async (
    data: RegisterInput
): Promise<RegisterResponse> => {
    const { name, email, password } = data;

    // 1. Check if email already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
        const error = new Error("Email đã được sử dụng") as Error & { statusCode: number };
        error.statusCode = 409;
        throw error;
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // 3. Create and save user
    const user = await UserModel.create({
        name,
        email,
        password: hashedPassword,
    });

    // 4. Return user info (no password)
    return { user: toUserResponse(user) };
};

// ─── Login ────────────────────────────────────────────────────────────────────

export const loginService = async (
    data: LoginInput
): Promise<LoginResponse> => {
    const { email, password } = data;
    console.log(email, password)
    // 1. Check if user exists
    const user = await UserModel.findOne({ email }).select("+password");
    console.log("user",user)
    if (!user) {
        const error = new Error("Email hoặc mật khẩu không đúng") as Error & { statusCode: number };
        error.statusCode = 401;
        throw error;
    }
    
    // 2. Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        const error = new Error("Email hoặc mật khẩu không đúng") as Error & { statusCode: number };
        error.statusCode = 401;
        throw error;
    }

    // 3. Generate JWT token (expiry from .env JWT_EXPIRES_IN)
    const token = signAccessToken({
        userId: (user._id as unknown as string).toString(),
        role: user.role,
    });

    // 4. Return token + user info
    return {
        token,
        user: toUserResponse(user),
    };
};

// ─── Forgot Password ──────────────────────────────────────────────────────────

export const forgotPasswordService = async (data: ForgotPasswordInput, clientUrl: string): Promise<void> => {
    const { email } = data;

    const user = await UserModel.findOne({ email });
    if (!user) {
        // To prevent email enumeration, we do not throw an error here.
        // We just return, and the controller will send a generic success message.
        return;
    }

    const resetToken = signResetPasswordToken((user._id as unknown as string).toString());

    await sendResetPasswordEmail({
        to: user.email,
        resetToken,
        clientUrl,
    });
};

// ─── Reset Password ───────────────────────────────────────────────────────────

export const resetPasswordService = async (data: ResetPasswordInput, clientUrl: string): Promise<void> => {
    const { token, newPassword } = data;

    let payload;
    try {
        payload = verifyResetPasswordToken(token);
    } catch (err) {
        const error = new Error("Token không hợp lệ hoặc đã hết hạn") as Error & { statusCode: number };
        error.statusCode = 400;
        throw error;
    }

    const user = await UserModel.findById(payload.userId);
    if (!user) {
        const error = new Error("Không tìm thấy người dùng") as Error & { statusCode: number };
        error.statusCode = 404;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    user.password = hashedPassword;
    await user.save();

    await sendPasswordChangedEmail({
        to: user.email,
        name: user.name,
        clientUrl,
    });
};
