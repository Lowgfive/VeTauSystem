import { Request, Response, NextFunction } from "express";
import * as trainService from "../services/train.service";

// Tạo tàu mới (kèm auto-generate toa + ghế)
export const createTrain = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await trainService.createTrain(req.body);
        res.status(201).json({
            success: true,
            message: "Tạo tàu thành công cùng các toa và ghế",
            data: result,
        });
    } catch (error: any) {
        // Xử lý lỗi trùng train_code (unique constraint)
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: `Mã tàu "${req.body.train_code}" đã tồn tại`,
            });
        }
        next(error);
    }
};

// Lấy danh sách tất cả tàu đang hoạt động
export const getAllTrains = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const trains = await trainService.getAllTrains();
        res.status(200).json({ success: true, data: trains });
    } catch (error) {
        next(error);
    }
};


// Lấy chi tiết 1 tàu (kèm danh sách toa)
export const getTrainById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await trainService.getTrainById(req.params.id as string);
        if (!result) {
            return res.status(404).json({ success: false, message: "Không tìm thấy tàu" });
        }
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

// Cập nhật thông tin tàu
export const updateTrain = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const train = await trainService.updateTrain(req.params.id as string, req.body);
        if (!train) {
            return res.status(404).json({ success: false, message: "Không tìm thấy tàu" });
        }
        res.status(200).json({
            success: true,
            message: "Cập nhật tàu thành công",
            data: train,
        });
    } catch (error) {
        next(error);
    }
};

// Xóa tàu (soft delete)
export const deleteTrain = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await trainService.deleteTrain(req.params.id as string);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};

// Lấy danh sách ghế của 1 toa cụ thể
export const getSeatsByCarriage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const seats = await trainService.getSeatsByCarriage(req.params.carriageId as string);
        res.status(200).json({ success: true, data: seats });
    } catch (error) {
        next(error);
    }
};

// Lấy tất cả toa + ghế đã nhóm theo toa → dùng để render SeatMap UI

export const getSeatMap = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await trainService.getSeatsByTrain(req.params.id as string);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};
