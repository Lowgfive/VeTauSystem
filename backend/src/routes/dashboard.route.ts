import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboard.controller";
import { protect, restrictTo } from "../middlewares/auth.middleware";

const routerDashboard = Router();

// Protect all routes - Admin only
routerDashboard.use(protect);
routerDashboard.use(restrictTo("admin"));

routerDashboard.get("/stats", getDashboardStats);

export default routerDashboard;
