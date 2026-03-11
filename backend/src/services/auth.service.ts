import bcrypt from "bcrypt";
import UserModel from "../models/user.model";
import { signAccessToken } from "../utils/jwt";
import type { RegisterInput, LoginInput } from "../schemas/auth.schema";
import type { UserResponse, LoginResponse, RegisterResponse } from "../types/auth.type";

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

    // 1. Check if user exists
    const user = await UserModel.findOne({ email }).select("+password");
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
