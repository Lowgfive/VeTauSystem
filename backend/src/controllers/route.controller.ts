import { Request, Response } from "express";
import { RouteService } from "../services/route.service";

export class RouteController {
  static async create(req: Request, res: Response) {
    const route = await RouteService.createRoute(req.body);
    res.status(201).json(route);
  }

  static async getAll(req: Request, res: Response) {
    const routes = await RouteService.getAllRoutes();
    res.json(routes);
  }
}


