import { Response } from "express";
import WalletModel from "../models/wallet.model";
import WalletTransactionModel, { TransactionType, TransactionStatus } from "../models/walletTransaction.model";
import BookingModel from "../models/booking.model";
import { asyncHandler } from "../utils/asyncHandler";
import { VNPayService } from "../services/vnpay.service";
import mongoose from "mongoose";

export class WalletController {
  /**
   * Get current user's wallet and transactions
   */
  static getWallet = asyncHandler(async (req: any, res: Response) => {
    const userId = req.user.userId;

    let wallet = await WalletModel.findOne({ user_id: userId });
    
    // Auto-create wallet if not exists
    if (!wallet) {
      wallet = await WalletModel.create({ user_id: userId, balance: 0 });
    }

    const transactions = await WalletTransactionModel.find({ wallet_id: wallet._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      data: {
        wallet,
        transactions,
      },
    });
  });

  /**
   * Initiate a deposit via VNPay
   */
  static deposit = asyncHandler(async (req: any, res: Response) => {
    const { amount } = req.body;
    const userId = req.user.userId;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Số tiền không hợp lệ" });
    }

    let wallet = await WalletModel.findOne({ user_id: userId });
    if (!wallet) {
      wallet = await WalletModel.create({ user_id: userId, balance: 0 });
    }

    const vnpay_txn_ref = `TOPUP_${Date.now()}`;
    
    // Create a pending transaction
    await WalletTransactionModel.create({
      wallet_id: wallet._id,
      amount,
      type: TransactionType.DEPOSIT,
      status: TransactionStatus.PENDING,
      vnpay_txn_ref,
      description: "Nạp tiền vào ví qua VNPay",
    });

    const ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress;

    const paymentUrl = VNPayService.createPaymentUrl(
      ipAddr,
      amount,
      vnpay_txn_ref,
      `Nap tien vao vi cho user ${userId}`
    );

    res.status(200).json({
      success: true,
      data: paymentUrl,
    });
  });

  /**
   * Pay for a booking using wallet balance
   */
  static payWithWallet = asyncHandler(async (req: any, res: Response) => {
    const { booking_id } = req.body;
    const userId = req.user.userId;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const booking = await BookingModel.findById(booking_id).session(session);
      if (!booking) {
        throw new Error("Không tìm thấy đơn hàng");
      }

      if (booking.status !== "pending") {
        throw new Error("Đơn hàng đã được thanh toán hoặc không hợp lệ");
      }

      const wallet = await WalletModel.findOne({ user_id: userId }).session(session);
      if (!wallet || wallet.balance < booking.price) {
        throw new Error("Số dư ví không đủ. Vui lòng nạp thêm tiền.");
      }

      // Deduct from wallet
      wallet.balance -= booking.price;
      await wallet.save({ session });

      // Create success transaction
      await WalletTransactionModel.create([{
        wallet_id: wallet._id,
        amount: booking.price,
        type: TransactionType.PAYMENT,
        status: TransactionStatus.SUCCESS,
        booking_id: booking._id,
        description: `Thanh toán đặt vé ${booking.booking_code}`,
      }], { session });

      // Update booking status
      booking.status = "paid";
      await booking.save({ session });

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        success: true,
        message: "Thanh toán bằng ví thành công",
      });
    } catch (error: any) {
      await session.abortTransaction();
      session.endSession();
      res.status(400).json({
        success: false,
        message: error.message || "Lỗi thanh toán bằng ví",
      });
    }
  });

  /**
   * Admin: Get all transactions
   */
  static getAllTransactions = asyncHandler(async (req: any, res: Response) => {
    const { page = 1, limit = 20, type, status, userId } = req.query;
    const query: any = {};

    if (type) query.type = type;
    if (status) query.status = status;
    
    const { search } = req.query;
    if (search) {
      // Search by vnpay_txn_ref or booking_id directly
      // Or find users by name/email and then find their wallets
      const users = await mongoose.model("User").find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }).select("_id");

      const userIds = users.map(u => u._id);
      const wallets = await WalletModel.find({ user_id: { $in: userIds } }).select("_id");
      const walletIds = wallets.map(w => w._id);

      query.$or = [
        { vnpay_txn_ref: { $regex: search, $options: "i" } },
        { wallet_id: { $in: walletIds } },
      ];
      
      // If search is a valid ObjectId, try searching by booking_id or _id
      if (mongoose.Types.ObjectId.isValid(search as string)) {
        query.$or.push({ booking_id: search });
        query.$or.push({ _id: search });
      }
    }

    if (userId) {
      const wallet = await WalletModel.findOne({ user_id: userId });
      if (wallet) {
        query.wallet_id = wallet._id;
      } else {
        return res.status(200).json({
          success: true,
          data: { transactions: [], total: 0 },
        });
      }
    }

    const transactions = await WalletTransactionModel.find(query)
      .populate({
        path: "wallet_id",
        populate: { path: "user_id", select: "name email phone cccd" },
      })
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await WalletTransactionModel.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        transactions,
        total,
        page: Number(page),
        limit: Number(limit),
      },
    });
  });

  /**
   * Admin: Get wallet stats
   */
  static getStats = asyncHandler(async (req: any, res: Response) => {
    const stats = await WalletTransactionModel.aggregate([
      {
        $group: {
          _id: "$type",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const totalBalance = await WalletModel.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$balance" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats,
        totalSystemBalance: totalBalance[0]?.total || 0,
      },
    });
  });
}
