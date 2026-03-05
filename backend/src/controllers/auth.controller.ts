import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { registerService, loginService } from "../services/auth.service";
import type { RegisterInput, LoginInput } from "../schemas/auth.schema";

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
