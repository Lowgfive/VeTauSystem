import UserModel from "../models/user.model";
import TransactionModel from "../models/transaction.model";

export class WalletService {
  /**
   * Get current balance of a user
   */
  static async getBalance(userId: string) {
    const user = await UserModel.findById(userId).select("balance");
    return user?.balance || 0;
  }

  /**
   * Deposit money into wallet
   */
  static async deposit(userId: string, amount: number, description: string = "Nạp tiền vào ví") {
    if (amount <= 0) throw new Error("Số tiền nạp phải lớn hơn 0");

    // Atomic increment
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $inc: { balance: amount } },
      { new: true }
    );

    if (!user) throw new Error("Không tìm thấy người dùng");

    const transaction = await TransactionModel.create({
      user_id: userId,
      amount,
      type: "deposit",
      description,
      status: "completed",
    });

    return { balance: user.balance, transaction };
  }

  /**
   * Create a pending deposit transaction
   */
  static async createPendingDeposit(userId: string, amount: number, txnRef: string, description: string = "Nạp tiền vào ví") {
    if (amount <= 0) throw new Error("Số tiền nạp phải lớn hơn 0");

    const transaction = await TransactionModel.create({
      user_id: userId,
      amount,
      type: "deposit",
      description,
      status: "pending",
      payment_txn_ref: txnRef,
    });

    return transaction;
  }

  /**
   * Complete a pending deposit
   */
  static async completeDeposit(txnRef: string) {
    const transaction = await TransactionModel.findOne({ payment_txn_ref: txnRef, status: "pending" });
    if (!transaction) throw new Error("Không tìm thấy giao dịch nạp tiền đang chờ hoặc đã được xử lý");

    // Atomic increment user balance
    const user = await UserModel.findByIdAndUpdate(
      transaction.user_id,
      { $inc: { balance: transaction.amount } },
      { new: true }
    );

    if (!user) throw new Error("Không tìm thấy người dùng");

    transaction.status = "completed";
    await transaction.save();

    return { balance: user.balance, transaction };
  }

  /**
   * Deduct money from wallet for payment
   */
  static async pay(userId: string, amount: number, description: string, bookingId?: string) {
    if (amount < 0) throw new Error("Số tiền thanh toán không hợp lệ");
    if (amount === 0) {
       const user = await UserModel.findById(userId).select("balance");
       return { balance: user?.balance || 0 };
    }

    // Atomic find and update with balance check
    const user = await UserModel.findOneAndUpdate(
      { _id: userId, balance: { $gte: amount } },
      { $inc: { balance: -amount } },
      { new: true }
    );

    if (!user) {
      // Check if user exists vs insufficient funds
      const exists = await UserModel.findById(userId);
      if (!exists) throw new Error("Không tìm thấy người dùng");
      throw new Error("Số dư ví không đủ. Vui lòng nạp thêm tiền.");
    }

    const transaction = await TransactionModel.create({
      user_id: userId,
      amount: -amount,
      type: "payment",
      description,
      booking_id: bookingId,
      status: "completed",
    });

    return { balance: user.balance, transaction };
  }

  /**
   * Refund money to wallet
   */
  static async refund(userId: string, amount: number, description: string, bookingId?: string) {
    if (amount < 0) throw new Error("Số tiền hoàn trả không hợp lệ");
    if (amount === 0) {
        const user = await UserModel.findById(userId).select("balance");
        return { balance: user?.balance || 0 };
    }

    // Atomic increment
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $inc: { balance: amount } },
      { new: true }
    );

    if (!user) throw new Error("Không tìm thấy người dùng");

    const transaction = await TransactionModel.create({
      user_id: userId,
      amount,
      type: "refund",
      description,
      booking_id: bookingId,
      status: "completed",
    });

    return { balance: user.balance, transaction };
  }
}
