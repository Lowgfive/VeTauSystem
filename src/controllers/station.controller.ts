import { Request, Response } from "express"
import { StationService } from "../services/station.service"

export class StationController {
  static async create(req: Request, res: Response) {
    const station = await StationService.createStation(req.body)
    res.status(201).json(station)
  }

  static async getAll(req: Request, res: Response) {
    const stations = await StationService.getAllStations()
    res.json(stations)
  }
}