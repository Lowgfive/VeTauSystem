import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { getProfileService, updateProfileService } from "../services/user.service";
import type { UpdateProfileInput } from "../schemas/user.schema";
import { AuthRequest } from "../middlewares/auth.middleware";

// ─── Get Current User Profile ─────────────────────────────────────────────────
// GET /api/v1/users/profile
// Protected by auth middleware

export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    // req.user is populated by the authMiddleware
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const userProfile = await getProfileService(userId);

    res.status(200).json({
        success: true,
        data: userProfile,
    });
});

// ─── Update Current User Profile ──────────────────────────────────────────────
// PUT /api/v1/users/profile
// Protected by auth middleware, validated by updateProfileSchema

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    const body = req.body as UpdateProfileInput;

    if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const updatedProfile = await updateProfileService(userId, {
        name: body.name,
        phone: body.phone,
        cccd: body.cccd,
    });

    res.status(200).json({
        success: true,
        message: "Cập nhật hồ sơ thành công",
        data: updatedProfile,
    });
});
