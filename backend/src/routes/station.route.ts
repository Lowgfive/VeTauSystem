import { asyncHandler } from "../utils/asyncHandler";
import { Router } from "express";
import { StationController } from "../controllers/station.controller";

const routerStation = Router();

routerStation.post("/", asyncHandler(StationController.create));
routerStation.get("/", asyncHandler(StationController.getAll));
routerStation.get("/code/:code", asyncHandler(StationController.getByCode));
routerStation.put("/:id", asyncHandler(StationController.update));
routerStation.delete("/:id", asyncHandler(StationController.delete));

export default routerStation;


