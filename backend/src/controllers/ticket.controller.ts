import { Request, Response, NextFunction } from "express";
import { generateTicketPDF } from "../services/pdfService";
import { sendTicketEmail } from "../services/emailService";
import BookingModel from "../models/booking.model";

// Hàm helper để chuẩn bị dữ liệu vé từ Booking document
const prepareTicketData = async (bookingCode: string) => {
    const booking = await BookingModel.findOne({ booking_code: bookingCode })
        .populate({
            path: "user_id",
            select: "name email"
        })
        .populate({
            path: "schedule_id",
            populate: {
                path: "route_id",
                populate: [
                    { path: "departure_station_id" },
                    { path: "arrival_station_id" }
                ]
            }
        })
        .populate({
            path: "seat_id",
            populate: {
                path: "carriage_id",
                populate: {
                    path: "train_id"
                }
            }
        });

    if (!booking) return null;

    const b = booking as any;
    return {
        bookingCode: b.booking_code,
        customerName: b.user_id?.name || "Khách hàng",
        ticketType: "Vé điện tử",
        lineName: b.seat_id?.carriage_id?.train_id?.train_name || "Tuyến tàu",
        fromStation: b.schedule_id?.route_id?.departure_station_id?.station_name || "Ga đi",
        toStation: b.schedule_id?.route_id?.arrival_station_id?.station_name || "Ga đến",
        validDate: new Date(b.schedule_id?.date).toLocaleDateString("vi-VN"),
        departureTime: b.schedule_id?.departure_time,
        carriageNumber: b.seat_id?.carriage_id?.carriage_number?.toString(),
        seatNumber: b.seat_id?.seat_number,
        seatType: b.seat_id?.carriage_id?.seat_type,
        price: b.price
    };
};

export const downloadTicket = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const bookingCode = req.params.bookingCode as string;
        if (!bookingCode) {
            return res.status(400).json({ success: false, message: "Missing booking code" });
        }

        const ticketData = await prepareTicketData(bookingCode);
        if (!ticketData) {
            return res.status(404).json({ success: false, message: "Không tìm thấy thông tin đặt vé" });
        }

        const pdfBuffer = await generateTicketPDF(ticketData);

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=ticket-${bookingCode}.pdf`,
            "Content-Length": pdfBuffer.length,
        });

        res.send(pdfBuffer);
    } catch (error) {
        console.error("Lỗi khi tạo vé PDF:", error);
        res.status(500).json({ success: false, message: "Không thể tạo file vé PDF" });
    }
};

export const sendEmailTicket = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { bookingCode, email } = req.body;

        if (!bookingCode || !email) {
            return res.status(400).json({ success: false, message: "Thiếu mã vé hoặc email." });
        }

        const ticketData = await prepareTicketData(bookingCode);
        if (!ticketData) {
            return res.status(404).json({ success: false, message: "Không tìm thấy thông tin đặt vé" });
        }

        const pdfBuffer = await generateTicketPDF(ticketData);

        await sendTicketEmail({
            to: email,
            customerEmail: email,
            bookingCode,
            pdfBuffer
        });

        res.status(200).json({
            success: true,
            message: `Vé điện tử đã được gửi thành công đến email: ${email}`,
        });
    } catch (error) {
        console.error("Lỗi khi gửi email:", error);
        res.status(500).json({ success: false, message: "Không thể gửi email đính kèm vé." });
    }
};
