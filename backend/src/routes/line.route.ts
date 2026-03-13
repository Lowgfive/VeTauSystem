import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { LineController } from "../controllers/line.controller";

const routerLine = Router();

routerLine.get("/", asyncHandler(LineController.getAll));

export default routerLine;
