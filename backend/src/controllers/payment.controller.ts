import { Request, Response } from "express";
import { VNPayService } from "../services/vnpay.service";
import BookingModel from "../models/booking.model";
import WalletModel from "../models/wallet.model";
import WalletTransactionModel, { TransactionStatus } from "../models/walletTransaction.model";
import { asyncHandler } from "../utils/asyncHandler";

export class PaymentController {
  static createPayment = asyncHandler(async (req: any, res: Response) => {
    const { booking_id } = req.body;
    const ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

    if (!booking_id) {
      return res.status(400).json({ success: false, message: "Thiếu booking_id" });
    }

    const booking = await BookingModel.findById(booking_id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    if (booking.status !== "pending") {
        return res.status(400).json({ success: false, message: "Trạng thái đơn hàng không hợp lệ để thanh toán" });
    }

    const paymentUrl = VNPayService.createPaymentUrl(
      ipAddr,
      booking.price,
      booking.booking_code,
      `Thanh toan ve tau cho ma booking ${booking.booking_code}`
    );

    res.status(200).json({
      success: true,
      data: paymentUrl,
    });
  });

  static vnpayReturn = asyncHandler(async (req: Request, res: Response) => {
    const vnp_Params = req.query;
    const isValid = VNPayService.validateReturn({ ...vnp_Params });
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

    if (!isValid) {
      return res.redirect(`${clientUrl}/payment-result?success=false&message=Signature+Invalid`);
    }

    const responseCode = vnp_Params["vnp_ResponseCode"];
    const bookingCode = vnp_Params["vnp_TxnRef"] as string;

    if (responseCode === "00") {
      if (bookingCode.startsWith("TOPUP_")) {
        // Find and update transaction
        const transaction = await WalletTransactionModel.findOneAndUpdate(
          { vnpay_txn_ref: bookingCode, status: TransactionStatus.PENDING },
          { status: TransactionStatus.SUCCESS },
          { new: true }
        );

        if (transaction) {
          // Increase wallet balance
          await WalletModel.findByIdAndUpdate(transaction.wallet_id, {
            $inc: { balance: transaction.amount },
          });
          
          return res.redirect(`${clientUrl}/wallet?success=true&message=Nạp+tiền+thành+công`);
        }
      } else {
        // Regular booking payment
        await BookingModel.findOneAndUpdate({ booking_code: bookingCode }, { status: 'paid' });
        return res.redirect(`${clientUrl}/payment-result?success=true&bookingCode=${bookingCode}`);
      }
    } else {
      // Payment failed
      if (bookingCode.startsWith("TOPUP_")) {
        await WalletTransactionModel.findOneAndUpdate(
          { vnpay_txn_ref: bookingCode },
          { status: TransactionStatus.FAILED }
        );
        return res.redirect(`${clientUrl}/wallet?success=false&message=Thanh+toán+thất+bại`);
      }
      return res.redirect(`${clientUrl}/payment-result?success=false&bookingCode=${bookingCode}&code=${responseCode}`);
    }

    // Default fallback
    res.redirect(`${clientUrl}`);
  });

  static vnpayIpn = asyncHandler(async (req: Request, res: Response) => {
    let vnp_Params = req.query;
    const isValid = VNPayService.validateReturn({ ...vnp_Params });

    if (!isValid) {
      return res.status(200).json({ RspCode: "97", Message: "Fail checksum" });
    }

    const responseCode = vnp_Params["vnp_ResponseCode"];
    const bookingCode = vnp_Params["vnp_TxnRef"] as string;

    // Check if order exists and status is pending
    if (bookingCode.startsWith("TOPUP_")) {
      const transaction = await WalletTransactionModel.findOne({ vnpay_txn_ref: bookingCode });
      if (!transaction) {
        return res.status(200).json({ RspCode: "01", Message: "Order not found" });
      }
      if (transaction.status !== TransactionStatus.PENDING) {
        return res.status(200).json({ RspCode: "02", Message: "Order already confirmed" });
      }

      if (responseCode === "00") {
        transaction.status = TransactionStatus.SUCCESS;
        await transaction.save();

        await WalletModel.findByIdAndUpdate(transaction.wallet_id, {
          $inc: { balance: transaction.amount },
        });
      } else {
        transaction.status = TransactionStatus.FAILED;
        await transaction.save();
      }
    } else {
      const booking = await BookingModel.findOne({ booking_code: bookingCode });
      if (!booking) {
        return res.status(200).json({ RspCode: "01", Message: "Order not found" });
      }
      if (booking.status !== "pending") {
        return res.status(200).json({ RspCode: "02", Message: "Order already confirmed" });
      }

      if (responseCode === "00") {
        booking.status = "paid";
        await booking.save();
      } else {
        // Optionally handle failed booking
      }
    }

    res.status(200).json({ RspCode: "00", Message: "Success" });
  });
}
