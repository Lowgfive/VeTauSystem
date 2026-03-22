import { Request, Response } from "express";
import { VNPayService } from "../services/vnpay.service";
import BookingModel from "../models/booking.model";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../middlewares/auth.middleware";

export class PaymentController {
  static createPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { booking_ids } = req.body as { booking_ids: string[] };

    const ipAddr =
      (req.headers["x-forwarded-for"] as string) ||
      req.socket.remoteAddress ||
      "127.0.0.1";

    if (!booking_ids || !Array.isArray(booking_ids) || booking_ids.length === 0) {
      return res.status(400).json({ success: false, message: "Thiếu booking_ids" });
    }

    const bookings = await BookingModel.find({ _id: { $in: booking_ids } });
    if (bookings.length === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    const totalAmount = bookings.reduce((sum, b) => sum + b.total_amount, 0);

    // Generate a single transaction reference for all bookings
    const txnRef = "TXN" + Date.now().toString(36).toUpperCase();

    // Store txnRef on all bookings
    await BookingModel.updateMany(
      { _id: { $in: booking_ids } },
      { payment_txn_ref: txnRef }
    );

    const paymentUrl = VNPayService.createPaymentUrl(
      ipAddr,
      totalAmount,
      txnRef,
      `Thanh toan ve tau - ${booking_ids.length} ve`
    );

    res.status(200).json({
      success: true,
      data: { paymentUrl, txnRef },
    });
  });

  static vnpayReturn = asyncHandler(async (req: Request, res: Response) => {
    const vnp_Params = { ...req.query };
    const isValid = VNPayService.validateReturn(vnp_Params);

    if (!isValid) {
      return res.redirect(
        `${process.env.CLIENT_URL}/payment-result?status=error&message=Chu+ky+khong+hop+le`
      );
    }

    const responseCode = vnp_Params["vnp_ResponseCode"];
    const txnRef = vnp_Params["vnp_TxnRef"] as string;

    if (responseCode === "00") {
      // Payment success - update all bookings with this txnRef
      await BookingModel.updateMany(
        { payment_txn_ref: txnRef },
        { status: "paid" }
      );

      return res.redirect(
        `${process.env.CLIENT_URL}/payment-result?status=success&txnRef=${txnRef}`
      );
    } else {
      // Payment failed
      await BookingModel.updateMany(
        { payment_txn_ref: txnRef },
        { status: "cancelled" }
      );

      return res.redirect(
        `${process.env.CLIENT_URL}/payment-result?status=failed&code=${responseCode}`
      );
    }
  });
}
