import express from "express";
import { register, login, forgotPassword, resetPassword } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate.middleware";
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from "../schemas/auth.schema";

const router = express.Router();

// POST /api/v1/auth/register
router.post("/register", validate(registerSchema), register);

// POST /api/v1/auth/login
router.post("/login", validate(loginSchema), login);

// POST /api/v1/auth/forgot-password
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);

// POST /api/v1/auth/reset-password
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

export default router;