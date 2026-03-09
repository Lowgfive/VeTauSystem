import { Request, Response, NextFunction } from "express";
import { MetroLineService } from "../services/metroline.service";

// Tạo tuyến Metro mới
export const createLine = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const line = await MetroLineService.createLine(req.body);
        res.status(201).json({
            success: true,
            message: "Tạo tuyến Metro thành công",
            data: line,
        });
    } catch (error: any) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: `Mã tuyến "${req.body.line_code}" đã tồn tại`,
            });
        }
        next(error);
    }
};

// Lấy tất cả tuyến Metro
export const getAllLines = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const lines = await MetroLineService.getAllLines();
        res.status(200).json({ success: true, data: lines });
    } catch (error) {
        next(error);
    }
};

// Lấy chi tiết 1 tuyến (kèm danh sách ga)
export const getLineById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const line = await MetroLineService.getLineById(req.params.id as string);
        if (!line) {
            return res.status(404).json({ success: false, message: "Không tìm thấy tuyến" });
        }
        res.status(200).json({ success: true, data: line });
    } catch (error) {
        next(error);
    }
};

// Cập nhật tuyến
export const updateLine = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const line = await MetroLineService.updateLine(req.params.id as string, req.body);
        if (!line) {
            return res.status(404).json({ success: false, message: "Không tìm thấy tuyến" });
        }
        res.status(200).json({
            success: true,
            message: "Cập nhật tuyến thành công",
            data: line,
        });
    } catch (error) {
        next(error);
    }
};

// Xóa tuyến (soft delete)
export const deleteLine = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const line = await MetroLineService.deleteLine(req.params.id as string);
        if (!line) {
            return res.status(404).json({ success: false, message: "Không tìm thấy tuyến" });
        }
        res.status(200).json({ success: true, message: "Đã xóa tuyến Metro" });
    } catch (error) {
        next(error);
    }
};

// Seed tuyến 5 (Văn Cao – Hòa Lạc) kèm 20 ga
export const seedLine5 = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await MetroLineService.seedLine5();
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};
