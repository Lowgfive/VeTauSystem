import { Router } from "express";
import { WalletController } from "../controllers/wallet.controller";
import { authMiddleware, adminMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Get balance and transactions
router.get("/my-wallet", authMiddleware, WalletController.getWallet);

// Top-up wallet
router.post("/top-up", authMiddleware, WalletController.deposit);

// Pay for booking
router.post("/pay", authMiddleware, WalletController.payWithWallet);

// Admin routes
router.get("/admin/transactions", authMiddleware, adminMiddleware, WalletController.getAllTransactions);
router.get("/admin/stats", authMiddleware, adminMiddleware, WalletController.getStats);

export default router;
