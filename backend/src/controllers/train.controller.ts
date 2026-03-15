import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import * as trainService from "../services/train.service";
import { Train } from "../models/train.model";

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

        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if (!id || !mongoose.Types.ObjectId.isValid(id as string)) {
            return res.status(400).json({ success: false, message: "ID tàu không hợp lệ" });
        }
        const result = await trainService.getTrainById(id);
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
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "ID tàu không hợp lệ" });
        }
        const train = await trainService.updateTrain(id, req.body);
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
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "ID tàu không hợp lệ" });
        }
        const result = await trainService.deleteTrain(id);
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
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "ID tàu không hợp lệ" });
        }

        // Kiểm tra tàu có tồn tại không trước khi lấy SeatMap
        const train = await Train.findById(id);
        if (!train) {
            return res.status(404).json({ success: false, message: "Không tìm thấy tàu với ID này" });
        }

        const result = await trainService.getSeatsByTrain(id);

        // Đảm bảo response có đúng format
        if (!result || typeof result !== 'object') {
            return res.status(500).json({
                success: false,
                message: "Lỗi khi lấy dữ liệu sơ đồ ghế"
            });
        }

        res.status(200).json({
            success: true,
            data: {
                carriages: result.carriages || [],
                seatsByCarriage: result.seatsByCarriage || {}
            }
        });
    } catch (error: any) {
        console.error("Error in getSeatMap controller:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Lỗi server khi lấy sơ đồ ghế"
        });
    }
};

// Generate toa và ghế cho tàu đã tồn tại
export const generateCarriagesForTrain = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "ID tàu không hợp lệ" });
        }

        const result = await trainService.generateCarriagesAndSeatsForExistingTrain(id);
        res.status(200).json({
            success: true,
            message: result.message || "Đã tạo toa và ghế thành công",
            data: result
        });
    } catch (error: any) {
        console.error("Error generating carriages:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Lỗi khi tạo toa và ghế"
        });
    }
};
