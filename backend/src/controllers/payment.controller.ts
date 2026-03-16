import { Request, Response } from "express";
import { VNPayService } from "../services/vnpay.service";
import BookingModel from "../models/booking.model";
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
    let vnp_Params = req.query;
    const isValid = VNPayService.validateReturn({ ...vnp_Params });

    if (isValid) {
      const responseCode = vnp_Params["vnp_ResponseCode"];
      const bookingCode = vnp_Params["vnp_TxnRef"];

      if (responseCode === "00") {
        // Payment success
        await BookingModel.findOneAndUpdate({ booking_code: bookingCode }, { status: 'paid' });

        return res.json({
          success: true,
          message: "Thanh toán thành công",
          bookingCode,
        });
      } else {
        return res.json({
          success: false,
          message: "Thanh toán thất bại",
          code: responseCode,
        });
      }
    } else {
      return res.status(400).json({ success: false, message: "Chữ ký không hợp lệ" });
    }
  });
}
