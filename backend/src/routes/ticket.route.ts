import express from "express";
import * as ticketController from "../controllers/ticket.controller";

const router = express.Router();

router.get("/download/:bookingCode", ticketController.downloadTicket);
router.post("/send-email", ticketController.sendEmailTicket);

export default router;
