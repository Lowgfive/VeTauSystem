import { asyncHandler } from "../utils/asyncHandler";
import { Router } from "express";
import { StationController } from "../controllers/station.controller";
import { authMiddleware, adminMiddleware } from "../middlewares/auth.middleware";

const routerStation = Router();

// Public routes (or user routes for booking)
routerStation.get("/", asyncHandler(StationController.getAll));
routerStation.get("/code/:code", asyncHandler(StationController.getByCode));

// Admin only routes
routerStation.post("/", authMiddleware, adminMiddleware, asyncHandler(StationController.create));
routerStation.put("/:id", authMiddleware, adminMiddleware, asyncHandler(StationController.update));
routerStation.delete("/:id", authMiddleware, adminMiddleware, asyncHandler(StationController.delete));

export default routerStation;


