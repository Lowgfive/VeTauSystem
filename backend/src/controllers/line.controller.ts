import { Request, Response } from "express";
import mongoose from "mongoose";
import { LineService } from "../services/line.service";

export class LineController {
    static async getAll(req: Request, res: Response) {
        try {
            const lines = await LineService.getAllLines();
            res.status(200).json({ success: true, data: lines });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const line = await LineService.createLine(req.body);
            res.status(201).json({ success: true, data: line, message: "Tạo tuyến thành công" });
        } catch (error: any) {
            if (error.code === 11000) {
                return res.status(400).json({
                    success: false,
                    message: `Mã tuyến hoặc tên tuyến đã tồn tại`
                });
            }
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ success: false, message: "ID tuyến không hợp lệ" });
            }
            const line = await LineService.updateLine(id, req.body);
            if (!line) {
                return res.status(404).json({ success: false, message: "Không tìm thấy tuyến" });
            }
            res.status(200).json({ success: true, data: line, message: "Cập nhật tuyến thành công" });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ success: false, message: "ID tuyến không hợp lệ" });
            }
            const line = await LineService.deleteLine(id);
            if (!line) {
                return res.status(404).json({ success: false, message: "Không tìm thấy tuyến" });
            }
            res.status(200).json({ success: true, message: "Đã xóa tuyến thành công" });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}
