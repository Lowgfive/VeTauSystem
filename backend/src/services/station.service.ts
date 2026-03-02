import { Station } from "../models/station.model";
import { IStation } from "../types/station.type";

export class StationService {
  static async createStation(data: IStation) {
    return await Station.create(data);
  }

  static async getAllStations() {
    return await Station.find();
  }

  static async getStationByCode(code: string) {
    return await Station.findOne({ code });
  }
}


