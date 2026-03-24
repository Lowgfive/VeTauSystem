import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboard.controller";
import { authMiddleware, adminMiddleware } from "../middlewares/auth.middleware";

const routerDashboard = Router();

// Protect all routes - Admin only
routerDashboard.use(authMiddleware);
routerDashboard.use(adminMiddleware);

routerDashboard.get("/stats", getDashboardStats);

export default routerDashboard;
