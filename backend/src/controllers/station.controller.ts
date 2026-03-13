import { Request, Response } from "express";
import mongoose from "mongoose";
import { StationService } from "../services/station.service";

export class StationController {
  static async create(req: Request, res: Response) {
    try {
      const station = await StationService.createStation(req.body);
      res.status(201).json({ success: true, data: station });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const stations = await StationService.getAllStations();
      res.status(200).json({ success: true, data: stations });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getByCode(req: Request, res: Response) {
    try {
      const station = await StationService.getStationByCode(req.params.code as string);
      if (!station) return res.status(404).json({ success: false, message: "Không tìm thấy ga" });
      res.status(200).json({ success: true, data: station });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "ID nhà ga không hợp lệ" });
      }
      const station = await StationService.updateStation(id, req.body);
      res.status(200).json({ success: true, data: station });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "ID nhà ga không hợp lệ" });
      }
      await StationService.deleteStation(id);
      res.status(200).json({ success: true, message: "Đã xóa ga thành công" });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}


