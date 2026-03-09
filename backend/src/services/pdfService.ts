import PDFDocument from "pdfkit";
import QRCode from "qrcode";

interface TicketData {
    bookingCode: string;
    ticketType: "Vé lượt" | "Vé ngày" | "Vé tháng";
    lineName: string; // e.g. "Tuyến Metro số 5 (Văn Cao - Hòa Lạc)"
    fromStation: string;
    toStation: string;
    validDate: string; // e.g. "08/03/2026"
    carriageNumber?: string;
    seatNumber?: string;
    seatType?: string;
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
                `LINE:L5|FROM:${ticket.fromStation}|TO:${ticket.toStation}|SEAT:${ticket.seatNumber || 'N/A'}|TICKET:${ticket.bookingCode}`
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

            addRow("Loại vé:", ticket.ticketType);
            addRow("Tuyến:", ticket.lineName);
            addRow("Ga đi:", ticket.fromStation);
            addRow("Ga đến:", ticket.toStation);
            addRow("Ngày hiệu lực:", ticket.validDate);
            if (ticket.carriageNumber && ticket.seatNumber) {
                addRow("Toa - Ghế:", `${ticket.carriageNumber} - ${ticket.seatNumber} (${ticket.seatType || 'Thường'})`);
            }
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
