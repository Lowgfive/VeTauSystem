import { asyncHandler } from "../utils/asyncHandler";
import { Router } from "express";
import { StationController } from "../controllers/station.controller";

const routerStation = Router();

routerStation.post("/", asyncHandler(StationController.create));
routerStation.get("/", asyncHandler(StationController.getAll));

export default routerStation;


