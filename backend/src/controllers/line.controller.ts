import { Request, Response } from "express";
import { StationService } from "../services/station.service";
import { Line } from "../models/line.model";

export class LineController {
    static async getAll(req: Request, res: Response) {
        try {
            const lines = await Line.find().populate("stations");
            res.status(200).json({ success: true, data: lines });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}
