import { Router } from "express";
import { RouteController } from "../controllers/route.controller";

const routerRoute = Router();

routerRoute.post("/", RouteController.create);
routerRoute.get("/", RouteController.getAll);

export default routerRoute;


