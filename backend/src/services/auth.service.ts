import bcrypt from "bcrypt";
import axios from "axios";
import UserModel from "../models/user.model";
import { signAccessToken } from "../utils/jwt";
import { OAuth2Client } from "google-auth-library";
import type { RegisterInput, LoginInput, ForgotPasswordInput, ResetPasswordInput, VerifyRegisterOtpInput, ResendRegisterOtpInput, GoogleLoginInput } from "../schemas/auth.schema";
import type { UserResponse, LoginResponse, RegisterResponse } from "../types/auth.type";
import { sendRegisterOtpEmail, sendResetPasswordEmail, sendPasswordChangedEmail } from "./emailService";
import { signResetPasswordToken, verifyResetPasswordToken } from "../utils/jwt";

// ─── Constants ────────────────────────────────────────────────────────────────

const SALT_ROUNDS = 10;
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

    const existingUser = await UserModel.findOne({ email });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    if (existingUser) {
        if (existingUser.isVerified) {
            const error = new Error("Email đã được sử dụng") as Error & { statusCode: number };
            error.statusCode = 409;
            throw error;
        } else {
            existingUser.name = name;
            existingUser.password = await bcrypt.hash(password, SALT_ROUNDS);
            existingUser.otp = otp;
            existingUser.otpExpiresAt = otpExpiresAt;
            await existingUser.save();
        }
    } else {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        await UserModel.create({
            name,
            email,
            password: hashedPassword,
            isVerified: false,
            otp,
            otpExpiresAt,
        });
    }

    // The email sending logic with bypass is assumed to be implemented within sendRegisterOtpEmail itself.
    // The provided code snippet for email bypass seems to be the internal logic of sendRegisterOtpEmail,
    // not a direct modification to this service function.
    // If the intention was to replace the call to sendRegisterOtpEmail with its full implementation here,
    // it would duplicate logic and make the file less maintainable.
    // Assuming the instruction implies that sendRegisterOtpEmail should handle the bypass internally.
    await sendRegisterOtpEmail({ to: email, otp, name });

    return { message: "Mã xác nhận đã được gửi đến email của bạn. Vui lòng kiểm tra email để hoàn tất đăng ký." };
};

// ─── Login ────────────────────────────────────────────────────────────────────

export const loginService = async (
    data: LoginInput
): Promise<LoginResponse> => {
    const { email, password } = data;
    console.log(email, password)
    // 1. Check if user exists
    const user = await UserModel.findOne({ email }).select("+password");
    console.log("user", user)
    if (!user) {
        const error = new Error("Email hoặc mật khẩu không đúng") as Error & { statusCode: number };
        error.statusCode = 401;
        throw error;
    }

    if (!user.isVerified) {
        const error = new Error("Tài khoản chưa được xác thực. Vui lòng xác thực email trước khi đăng nhập.") as Error & { statusCode: number };
        error.statusCode = 403;
        throw error;
    }

    // 2. Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        console.log(`❌ Login failed: Password mismatch for ${email}`);
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

// ─── Verification OTP ─────────────────────────────────────────────────────────

export const verifyRegisterOtpService = async (
    data: VerifyRegisterOtpInput
): Promise<LoginResponse> => {
    const { email, otp } = data;

    const user = await UserModel.findOne({ email }).select("+otp +otpExpiresAt");
    if (!user) {
        const error = new Error("Tài khoản không tồn tại") as Error & { statusCode: number };
        error.statusCode = 404;
        throw error;
    }

    if (user.isVerified) {
        const error = new Error("Tài khoản đã được xác thực") as Error & { statusCode: number };
        error.statusCode = 400;
        throw error;
    }

    if (user.otp !== otp) {
        const error = new Error("Mã xác nhận không hợp lệ") as Error & { statusCode: number };
        error.statusCode = 400;
        throw error;
    }

    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
        const error = new Error("Mã xác nhận đã hết hạn") as Error & { statusCode: number };
        error.statusCode = 400;
        throw error;
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    const token = signAccessToken({
        userId: (user._id as unknown as string).toString(),
        role: user.role,
    });

    return {
        token,
        user: toUserResponse(user),
    };
};

export const resendRegisterOtpService = async (
    data: ResendRegisterOtpInput
): Promise<{ message: string }> => {
    const { email } = data;

    const user = await UserModel.findOne({ email });
    if (!user) {
        const error = new Error("Tài khoản không tồn tại") as Error & { statusCode: number };
        error.statusCode = 404;
        throw error;
    }

    if (user.isVerified) {
        const error = new Error("Tài khoản đã được xác thực") as Error & { statusCode: number };
        error.statusCode = 400;
        throw error;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    await sendRegisterOtpEmail({ to: email, otp, name: user.name });

    return { message: "Mã xác nhận đã được gửi lại." };
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

// ─── Google Login ─────────────────────────────────────────────────────────────

export const googleLoginService = async (data: GoogleLoginInput): Promise<LoginResponse> => {
    const { token } = data;

    try {
        // Fetch user info from Google API using access_token
        const googleResponse = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const payload = googleResponse.data;
        if (!payload || !payload.email) {
            throw new Error("Không thể lấy thông tin người dùng từ Google");
        }

        const { email, name, sub: googleId } = payload;

        let user = await UserModel.findOne({ email });

        if (!user) {
            // Create new user if not exists
            user = await UserModel.create({
                email,
                name: name || email.split("@")[0],
                googleId,
                isVerified: true,
                password: await bcrypt.hash(Math.random().toString(36).slice(-10), SALT_ROUNDS),
            });
        } else if (!user.googleId) {
            // Link Google account to existing user
            user.googleId = googleId;
            user.isVerified = true;
            await user.save();
        }

        const accessToken = signAccessToken({
            userId: (user._id as unknown as string).toString(),
            role: user.role,
        });

        return {
            token: accessToken,
            user: toUserResponse(user),
        };
    } catch (err) {
        console.error("Google Auth Error:", err);
        const error = new Error("Xác thực Google không thành công") as Error & { statusCode: number };
        error.statusCode = 401;
        throw error;
    }
};
