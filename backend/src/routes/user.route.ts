import express from "express";
import { getProfile, updateProfile } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { updateProfileSchema } from "../schemas/user.schema";

const router = express.Router();

// Apply authMiddleware to all user routes
router.use(authMiddleware);

// GET /api/v1/users/profile
router.get("/profile", getProfile);

// PUT /api/v1/users/profile
router.put("/profile", validate(updateProfileSchema), updateProfile);

export default router;
