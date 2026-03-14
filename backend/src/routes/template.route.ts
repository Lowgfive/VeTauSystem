import { Router } from "express";
import {
    createCarriageTemplate,
    getAllCarriageTemplates,
    createTrainTemplate,
    getAllTrainTemplates,
    getTrainTemplateById
} from "../controllers/template.controller";

const router = Router();

// Carriage Templates
router.post("/carriages", createCarriageTemplate);
router.get("/carriages", getAllCarriageTemplates);

// Train Templates
router.post("/trains", createTrainTemplate);
router.get("/trains", getAllTrainTemplates);
router.get("/trains/:id", getTrainTemplateById);

export default router;
