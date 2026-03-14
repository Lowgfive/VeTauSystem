import { Request, Response, NextFunction } from "express";
import { TrainTemplate, CarriageTemplate } from "../models";

// ─── Carriage Template CRUD ──────────────────────────────────────────────

export const createCarriageTemplate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const template = await CarriageTemplate.create(req.body);
        res.status(201).json({ success: true, data: template });
    } catch (error) {
        next(error);
    }
};

export const getAllCarriageTemplates = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const templates = await CarriageTemplate.find().sort({ name: 1 });
        res.status(200).json({ success: true, data: templates });
    } catch (error) {
        next(error);
    }
};

// ─── Train Template CRUD ──────────────────────────────────────────────────

export const createTrainTemplate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const template = await TrainTemplate.create(req.body);
        res.status(201).json({ success: true, data: template });
    } catch (error) {
        next(error);
    }
};

export const getAllTrainTemplates = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const templates = await TrainTemplate.find()
            .populate("carriage_templates")
            .sort({ template_name: 1 });
        res.status(200).json({ success: true, data: templates });
    } catch (error) {
        next(error);
    }
};

export const getTrainTemplateById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const template = await TrainTemplate.findById(req.params.id).populate("carriage_templates");
        if (!template) {
            return res.status(404).json({ success: false, message: "Không tìm thấy mẫu tàu" });
        }
        res.status(200).json({ success: true, data: template });
    } catch (error) {
        next(error);
    }
};
