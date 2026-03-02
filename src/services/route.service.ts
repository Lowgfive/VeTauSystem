import { Route } from "../models/route.model"
import { IRoute } from "../types/route.type"

export class RouteService {
  static async createRoute(data: IRoute) {
    return await Route.create(data)
  }

  static async getAllRoutes() {
    return await Route.find()
      .populate("departure_station_id")
      .populate("arrival_station_id")
  }
}