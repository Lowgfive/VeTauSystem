import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Require auth (and admin role in production)
router.get("/stats", authMiddleware, DashboardController.getStats);

export default router;
