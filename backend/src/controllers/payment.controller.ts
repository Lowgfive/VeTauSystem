import { Request, Response } from "express";
import { VNPayService } from "../services/vnpay.service";
import BookingModel from "../models/booking.model";
import { BookingPassenger } from "../models/bookingpassenger.model";
import * as seatService from "../services/seat.service";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthRequest } from "../middlewares/auth.middleware";
import { WalletService } from "../services/wallet.service";

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

  static createDepositPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { amount } = req.body as { amount: number };
    const userId = req.user?.userId;

    if (!amount || isNaN(amount) || amount < 10000 || !userId) {
      return res.status(400).json({ success: false, message: "Số tiền nạp không hợp lệ (tối thiểu 10,000đ)" });
    }

    const ipAddr =
      (req.headers["x-forwarded-for"] as string) ||
      req.socket.remoteAddress ||
      "127.0.0.1";

    // Generate a unique transaction reference for deposit
    const txnRef = "DEP" + Date.now().toString(36).toUpperCase();

    // Create pending transaction in database
    await WalletService.createPendingDeposit(userId, amount, txnRef, `Nạp tiền vào ví qua VNPay`);

    const paymentUrl = VNPayService.createPaymentUrl(
      ipAddr,
      amount,
      txnRef,
      `Nap tien vao vi - ${amount.toLocaleString()} VND`
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
      if (txnRef.startsWith("DEP")) {
        // Handle Wallet Deposit
        try {
            await WalletService.completeDeposit(txnRef);
            return res.redirect(
                `${process.env.CLIENT_URL || "http://localhost:3000"}/payment-result?status=success&txnRef=${txnRef}`
            );
        } catch (error: any) {
            return res.redirect(
                `${process.env.CLIENT_URL || "http://localhost:3000"}/payment-result?status=error&message=${encodeURIComponent(error.message)}`
            );
        }
      }

      // Handle Booking Payment
      const paidBookings = await BookingModel.find({ payment_txn_ref: txnRef })
        .populate({ path: "schedule_id", select: "train_id" })
        .populate({ path: "departure_station_id", select: "station_order" })
        .populate({ path: "arrival_station_id", select: "station_order" })
        .lean();

      // Payment success - update all bookings with this txnRef
      await BookingModel.updateMany(
        { payment_txn_ref: txnRef },
        { status: "paid" }
      );

      const bookingIds = paidBookings.map((booking: any) => booking._id);
      if (bookingIds.length > 0) {
        await BookingPassenger.updateMany(
          { booking_id: { $in: bookingIds } },
          { status: "paid" }
        );

        const bookingPassengers = await BookingPassenger.find({
          booking_id: { $in: bookingIds },
        })
          .populate({ path: "seat_id", select: "seat_number" })
          .lean();

        const bookingMap = new Map(
          paidBookings.map((booking: any) => [String(booking._id), booking])
        );

        for (const bookingPassenger of bookingPassengers as any[]) {
          const booking = bookingMap.get(String(bookingPassenger.booking_id));
          const trainId = booking?.schedule_id?.train_id?.toString();
          const scheduleId = booking?.schedule_id?._id?.toString?.() || booking?.schedule_id?.toString?.();
          const depOrder = booking?.departure_station_id?.station_order;
          const arrOrder = booking?.arrival_station_id?.station_order;
          const seatId = bookingPassenger.seat_id?._id?.toString?.() || bookingPassenger.seat_id?.toString?.();
          const seatNumber = bookingPassenger.seat_id?.seat_number;

          if (
            !trainId ||
            !scheduleId ||
            !seatId ||
            !seatNumber ||
            depOrder == null ||
            arrOrder == null
          ) {
            continue;
          }

          seatService.emitSeatBooked(
            trainId,
            scheduleId,
            seatId,
            seatNumber,
            depOrder,
            arrOrder
          );
        }
      }

      return res.redirect(
        `${process.env.CLIENT_URL || "http://localhost:3000"}/payment-result?status=success&txnRef=${txnRef}`
      );
    } else {
      // Payment failed
      if (!txnRef.startsWith("DEP")) {
        await BookingModel.updateMany(
          { payment_txn_ref: txnRef },
          { status: "cancelled" }
        );
      }

      return res.redirect(
        `${process.env.CLIENT_URL || "http://localhost:3000"}/payment-result?status=failed&code=${responseCode}&txnRef=${txnRef}`
      );
    }
  });
}
