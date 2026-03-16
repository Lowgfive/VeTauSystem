import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { LineController } from "../controllers/line.controller";

const routerLine = Router();

routerLine.get("/", asyncHandler(LineController.getAll));
routerLine.post("/", asyncHandler(LineController.create));
routerLine.put("/:id", asyncHandler(LineController.update));
routerLine.delete("/:id", asyncHandler(LineController.delete));

export default routerLine;
