import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/create-payment", authMiddleware, PaymentController.createPayment);

router.post("/create-deposit-payment", authMiddleware, PaymentController.createDepositPayment);

router.get("/vnpay_return", PaymentController.vnpayReturn);

export default router;
