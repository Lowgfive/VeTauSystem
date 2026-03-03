import PDFDocument from "pdfkit";
import QRCode from "qrcode";

interface TicketData {
    bookingCode: string;
    passengerName: string;
    passengerId: string;
    passengerType: string;
    fromStation: string;
    toStation: string;
    departure: string; // e.g. "2026-03-10 08:00"
    arrival: string;
    trainName: string;
    carriageNumber: string;
    seatNumber: string;
    seatType: string;
    price: number;
}

export const generateTicketPDF = async (ticket: TicketData): Promise<Buffer> => {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: "A5", margin: 30 });
            const buffers: Buffer[] = [];

            doc.on("data", (chunk) => buffers.push(chunk));
            doc.on("end", () => resolve(Buffer.concat(buffers)));
            doc.on("error", reject);

            // Generate QR code as data URL
            const qrDataUrl = await QRCode.toDataURL(
                `CODE:${ticket.bookingCode}|ID:${ticket.passengerId}|SEAT:${ticket.seatNumber}`
            );
            const qrBuffer = Buffer.from(qrDataUrl.split(",")[1], "base64");

            // Header
            doc
                .fillColor("#1a73e8")
                .fontSize(18)
                .text("🚄 VÉ TÀU ĐIỆN TỬ", { align: "center" })
                .moveDown(0.3);

            doc
                .fillColor("#e53935")
                .fontSize(14)
                .text(`Mã đặt chỗ: ${ticket.bookingCode}`, { align: "center" })
                .moveDown(0.5);

            doc.moveTo(30, doc.y).lineTo(450, doc.y).strokeColor("#ccc").stroke().moveDown(0.5);

            // Ticket info
            const col1 = 30;
            const col2 = 180;
            doc.fillColor("#333").fontSize(10);

            const addRow = (label: string, value: string) => {
                const y = doc.y;
                doc.font("Helvetica-Bold").text(label, col1, y, { continued: false });
                doc.font("Helvetica").text(value, col2, y);
                doc.moveDown(0.4);
            };

            addRow("Họ và tên:", ticket.passengerName);
            addRow("CCCD/Hộ chiếu:", ticket.passengerId);
            addRow("Đối tượng:", ticket.passengerType);
            addRow("Tàu:", ticket.trainName);
            addRow("Ga đi:", ticket.fromStation);
            addRow("Ga đến:", ticket.toStation);
            addRow("Giờ khởi hành:", ticket.departure);
            addRow("Giờ đến dự kiến:", ticket.arrival);
            addRow("Toa - Ghế:", `${ticket.carriageNumber} - ${ticket.seatNumber} (${ticket.seatType})`);
            addRow("Giá vé:", `${ticket.price.toLocaleString("vi-VN")} VNĐ`);

            doc.moveTo(30, doc.y).lineTo(450, doc.y).strokeColor("#ccc").stroke().moveDown(0.5);

            // QR Code
            doc.image(qrBuffer, { fit: [100, 100], align: "center" });
            doc.moveDown(0.3);
            doc
                .fillColor("#888")
                .fontSize(8)
                .text("Xuất trình mã QR này khi lên tàu.", { align: "center" });

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
};
