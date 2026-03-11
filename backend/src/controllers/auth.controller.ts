import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import type { RegisterInput, LoginInput, ForgotPasswordInput, ResetPasswordInput } from "../schemas/auth.schema";
import { registerService, loginService, forgotPasswordService, resetPasswordService } from "../services/auth.service";

// ─── Register ─────────────────────────────────────────────────────────────────
// POST /api/v1/auth/register
// Body is pre-validated by validate(registerSchema) middleware

export const register = asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as RegisterInput;

    const result = await registerService(body);

    res.status(201).json({
        success: true,
        message: "Đăng ký thành công",
        data: result,
    });
});

// ─── Login ────────────────────────────────────────────────────────────────────
// POST /api/v1/auth/login
// Body is pre-validated by validate(loginSchema) middleware

export const login = asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as LoginInput;

    const result = await loginService(body);

    res.status(200).json({
        success: true,
        message: "Đăng nhập thành công",
        data: result,
    });
});

// ─── Forgot Password ──────────────────────────────────────────────────────────
// POST /api/v1/auth/forgot-password

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as ForgotPasswordInput;
    const clientUrl = req.headers.origin || process.env.CLIENT_URL || "http://localhost:5173";

    await forgotPasswordService(body, clientUrl);

    res.status(200).json({
        success: true,
        message: "Nếu email tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.",
    });
});

// ─── Reset Password ───────────────────────────────────────────────────────────
// POST /api/v1/auth/reset-password

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as ResetPasswordInput;
    const clientUrl = req.headers.origin || process.env.CLIENT_URL || "http://localhost:5173";

    await resetPasswordService(body, clientUrl);

    res.status(200).json({
        success: true,
        message: "Mật khẩu của bạn đã được cập nhật thành công.",
    });
});
