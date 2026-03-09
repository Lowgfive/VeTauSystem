import { Request, Response, NextFunction } from "express";
import { generateTicketPDF } from "../services/pdfService";
import { sendTicketEmail } from "../services/emailService";

// Mock data generator for Metro tickets
const generateMockMetroTicket = (bookingCode: string) => {
    return {
        bookingCode,
        ticketType: "Vé lượt" as const,
        lineName: "Tuyến Metro số 5 (Văn Cao - Hòa Lạc)",
        fromStation: "Quần Ngựa",
        toStation: "Mễ Trì",
        validDate: new Date().toLocaleDateString("vi-VN"),
        carriageNumber: "1",
        seatNumber: "4A",
        seatType: "Thường",
        price: 15000,
    };
};

export const downloadTicket = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const bookingCode = req.params.bookingCode;
        if (!bookingCode) {
            return res.status(400).json({ success: false, message: "Missing booking code" });
        }
        const mockTicket = generateMockMetroTicket(bookingCode as string);

        const pdfBuffer = await generateTicketPDF(mockTicket);

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=metro-ticket-${bookingCode}.pdf`,
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

        const mockTicket = generateMockMetroTicket(bookingCode);
        const pdfBuffer = await generateTicketPDF(mockTicket);

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
