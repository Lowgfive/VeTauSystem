import { z } from "zod";

// ─── Register Schema ──────────────────────────────────────────────────────────

export const registerSchema = z.object({
    name: z
        .string()
        .min(2, "Tên tối thiểu 2 ký tự")
        .max(50, "Tên tối đa 50 ký tự")
        .trim(),

    email: z
        .string()
        .email("Email không hợp lệ")
        .toLowerCase()
        .trim(),

    password: z
        .string()
        .min(6, "Mật khẩu tối thiểu 6 ký tự")
        .max(100, "Mật khẩu tối đa 100 ký tự"),
});

// ─── Verification OTP Schema ──────────────────────────────────────────────────

export const verifyRegisterOtpSchema = z.object({
    email: z
        .string()
        .email("Email không hợp lệ")
        .toLowerCase()
        .trim(),
    otp: z
        .string()
        .length(6, "Mã OTP phải có đúng 6 chữ số"),
});

export const resendRegisterOtpSchema = z.object({
    email: z
        .string()
        .email("Email không hợp lệ")
        .toLowerCase()
        .trim(),
});

// ─── Login Schema ─────────────────────────────────────────────────────────────

export const loginSchema = z.object({
    email: z
        .string()
        .email("Email không hợp lệ")
        .toLowerCase()
        .trim(),

    password: z
        .string()
        .min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

// ─── Forgot Password Schema ───────────────────────────────────────────────────

export const forgotPasswordSchema = z.object({
    email: z
        .string()
        .email("Email không hợp lệ")
        .toLowerCase()
        .trim(),
});

// ─── Reset Password Schema ────────────────────────────────────────────────────

export const resetPasswordSchema = z.object({
    token: z.string().min(1, "Token không hợp lệ"),
    newPassword: z
        .string()
        .min(6, "Mật khẩu tối thiểu 6 ký tự")
        .max(100, "Mật khẩu tối đa 100 ký tự"),
});

// ─── Google Login Schema ──────────────────────────────────────────────────────

export const googleLoginSchema = z.object({
    token: z.string().min(1, "Token không hợp lệ"),
});

// ─── Inferred TypeScript Types ────────────────────────────────────────────────

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyRegisterOtpInput = z.infer<typeof verifyRegisterOtpSchema>;
export type ResendRegisterOtpInput = z.infer<typeof resendRegisterOtpSchema>;
export type GoogleLoginInput = z.infer<typeof googleLoginSchema>;
