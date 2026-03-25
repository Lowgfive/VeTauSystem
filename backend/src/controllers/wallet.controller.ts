import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../middlewares/auth.middleware";
import { WalletService } from "../services/wallet.service";
import TransactionModel from "../models/transaction.model";

export const getBalance = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const balance = await WalletService.getBalance(userId);
    res.status(200).json({ success: true, data: { balance } });
});

export const deposit = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    const { amount } = req.body;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
    if (!amount || amount <= 0) return res.status(400).json({ success: false, message: "Số tiền không hợp lệ" });

    const result = await WalletService.deposit(userId, amount);
    res.status(200).json({ success: true, message: "Nạp tiền thành công", data: result });
});

export const getTransactions = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const transactions = await TransactionModel.find({ user_id: userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: transactions });
});
