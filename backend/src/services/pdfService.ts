import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import path from "path";

interface TicketData {
    bookingCode: string;
    customerName: string; // Thêm tên khách hàng
    ticketType: string;
    lineName: string;
    fromStation: string;
    toStation: string;
    validDate: string;
    carriageNumber?: string;
    seatNumber?: string;
    seatType?: string;
    price: number;
}


export const generateTicketPDF = async (ticket: any): Promise<Buffer> => {
    return new Promise(async (resolve, reject) => {
        try {
            // Khởi tạo document A5 Landscape
            const doc = new PDFDocument({ size: "A5", layout: "landscape", margin: 0 });
            const buffers: Buffer[] = [];

            doc.on("data", (chunk) => buffers.push(chunk));
            doc.on("end", () => resolve(Buffer.concat(buffers)));
            doc.on("error", reject);

            // Tạo mã QR (Dùng màu đen)
            const qrDataUrl = await QRCode.toDataURL(
                `RAIL-L5|${ticket.bookingCode}|${ticket.fromStation}-${ticket.toStation}`,
                { color: { dark: '#000000', light: '#ffffff' }, margin: 1 }
            );
            const qrBuffer = Buffer.from(qrDataUrl.split(",")[1], "base64");

            // Fonts (Đảm bảo đường dẫn chính xác trong môi trường của bạn)
            const fontRegular = path.join(__dirname, "../assets/fonts/arial.ttf");
            const fontBold = path.join(__dirname, "../assets/fonts/arialbd.ttf");

            // --- Bảng màu Emerald ---
            const emerald50 = "#f0fdf4";
            const emerald100 = "#d1fae5";
            const emerald500 = "#10b981";
            const emerald600 = "#059669";
            const emerald800 = "#065f46";
            const emerald900 = "#064e3b";
            const gray400 = "#9ca3af";
            const gray800 = "#1f2937";

            // 1. Vẽ nền trang
            doc.rect(0, 0, doc.page.width, doc.page.height).fill(emerald50);

            // 2. Kích thước và vị trí thẻ vé
            const cardW = 540;
            const cardH = 216;
            const startX = (doc.page.width - cardW) / 2;
            const startY = (doc.page.height - cardH) / 2;
            const dividerX = startX + (cardW * 0.72); // Vị trí vạch đứt

            // Shadow
            doc.roundedRect(startX + 5, startY + 10, cardW, cardH, 25).fillColor("#064e3b").fillOpacity(0.1).fill();
            doc.fillOpacity(1);

            // Khung chính
            doc.roundedRect(startX, startY, cardW, cardH, 25).fillAndStroke("white", emerald100);

            // Clip để nội dung không tràn ra ngoài bo góc
            doc.save();
            doc.roundedRect(startX, startY, cardW, cardH, 25).clip();

            // ================= PANEL TRÁI (THÔNG TIN) =================
            const padX = startX + 30;

            // Logo & Icon Đoàn tàu
            doc.roundedRect(padX, startY + 25, 35, 35, 10).fill(emerald600);

            // Vẽ biểu tượng đoàn tàu
            doc.fillColor("white");
            doc.roundedRect(padX + 7, startY + 34, 21, 14, 3).fill(); // Thân tàu ngoài (trắng)
            doc.roundedRect(padX + 9, startY + 36, 17, 7, 1).fillColor(emerald600).fill(); // Cửa sổ ngang to (xanh)
            doc.circle(padX + 13, startY + 45, 1.5).fillColor(emerald600).fill(); // Đèn lấy sáng 1
            doc.circle(padX + 22, startY + 45, 1.5).fillColor(emerald600).fill(); // Đèn lấy sáng 2
            doc.rect(padX + 11, startY + 48, 3, 3).fillColor("white").fill(); // Chân (bánh) 1
            doc.rect(padX + 21, startY + 48, 3, 3).fillColor("white").fill(); // Chân (bánh) 2

            doc.font(fontBold).fillColor(emerald900).fontSize(12).text("HANOI RAILWAY", padX + 45, startY + 28);
            doc.font(fontBold).fillColor(emerald600).fontSize(7).text("HỆ THỐNG GIAO THÔNG XANH", padX + 45, startY + 42, { characterSpacing: 1 });

            // Booking Code
            doc.font(fontBold).fillColor(gray400).fontSize(7).text("MÃ ĐẶT CHỖ", dividerX - 130, startY + 28, { align: "right", width: 100 });
            doc.font(fontBold).fillColor(emerald800).fontSize(16).text(ticket.bookingCode, dividerX - 180, startY + 38, { align: "right", width: 150 });

            // Khách hàng (cùng dòng)
            const customerY = startY + 75;
            doc.font(fontBold).fillColor(gray400).fontSize(7).text("HÀNH KHÁCH:", padX, customerY);
            doc.font(fontBold).fillColor(gray800).fontSize(11).text(ticket.customerName.toUpperCase(), padX + 55, customerY - 1.5);

            // Lộ trình (Route Visual)
            const routeY = startY + 105;
            const leftBound = padX;
            const rightBound = dividerX - 25;
            const centerSection = (leftBound + rightBound) / 2;
            const gapWidth = 40;
            const stationWidth = (rightBound - leftBound - gapWidth) / 2;

            doc.font(fontBold).fillColor(gray400).fontSize(7).text("GA ĐI", leftBound, routeY);
            doc.font(fontBold).fillColor(emerald900).fontSize(15).text(ticket.fromStation, leftBound, routeY + 12, { width: stationWidth, align: "left" });

            doc.font(fontBold).fillColor(gray400).fontSize(7).text("GA ĐẾN", rightBound - stationWidth, routeY, { align: "right", width: stationWidth });
            doc.font(fontBold).fillColor(emerald900).fontSize(15).text(ticket.toStation, rightBound - stationWidth, routeY + 12, { width: stationWidth, align: "right" });

            // Đường nối & Mũi tên
            const lineY = routeY + 20;
            const lineStartX = leftBound + stationWidth + 5;
            const lineEndX = rightBound - stationWidth - 5;

            doc.moveTo(lineStartX, lineY).lineTo(lineEndX, lineY).lineWidth(1.5).strokeColor(emerald100).stroke();
            doc.circle(centerSection, lineY, 10).fillAndStroke(emerald600, "white").lineWidth(1.5).stroke();
            doc.fillColor("white").fontSize(10).text("→", centerSection - 6, lineY - 4);

            // Chi tiết vé
            const detailY = startY + 155;
            doc.moveTo(padX, detailY - 10).lineTo(dividerX - 30, detailY - 10).lineWidth(0.5).strokeColor("#f3f4f6").stroke();

            doc.font(fontBold).fillColor(gray400).fontSize(7).text("NGÀY ĐI", padX, detailY);
            doc.font(fontBold).fillColor(gray800).fontSize(10).text(ticket.validDate, padX, detailY + 12);

            doc.font(fontBold).fillColor(gray400).fontSize(7).text("VỊ TRÍ", padX + 90, detailY);
            doc.font(fontBold).fillColor(gray800).fontSize(10).text(ticket.seatNumber || "Tự do", padX + 90, detailY + 12);

            doc.font(fontBold).fillColor(gray400).fontSize(7).text("LOẠI VÉ", padX + 170, detailY);
            doc.font(fontBold).fillColor(emerald600).fontSize(10).text("Vé lượt (Single)", padX + 170, detailY + 12);

            // Giá tiền Box
            doc.roundedRect(dividerX - 110, detailY - 5, 80, 35, 12).fillColor("#ecfdf5").stroke(emerald100);
            doc.font(fontBold).fillColor(emerald800).fontSize(6).text("TỔNG TIỀN", dividerX - 110, detailY, { align: "center", width: 80 });
            doc.font(fontBold).fillColor(emerald900).fontSize(14).text(`${ticket.price.toLocaleString()}đ`, dividerX - 110, detailY + 10, { align: "center", width: 80 });

            // ================= PANEL PHẢI (QR) =================
            doc.rect(dividerX, startY, cardW - (dividerX - startX), cardH).fill(emerald900);

            // Vạch đứt & Lỗ khuyết
            doc.moveTo(dividerX, startY).lineTo(dividerX, startY + cardH).lineWidth(2).dash(6, { space: 6 }).strokeColor(emerald100).stroke().undash();
            doc.circle(dividerX, startY, 15).fill(emerald50);
            doc.circle(dividerX, startY + cardH, 15).fill(emerald50);

            // QR Code Box
            const qrSize = 100;
            const qrX = dividerX + (cardW * 0.28 - qrSize) / 2;
            doc.save();
            doc.rotate(1, { origin: [qrX + qrSize / 2, startY + 35 + qrSize / 2] });
            doc.roundedRect(qrX, startY + 35, qrSize, qrSize, 15).fill("white");
            doc.image(qrBuffer, qrX + 8, startY + 43, { width: qrSize - 16 });
            doc.restore();

            // Thẻ E-PASS
            doc.roundedRect(qrX + 20, startY + 150, 60, 16, 8).fillColor("white").fillOpacity(0.15).fill();
            doc.fillOpacity(1).font(fontBold).fillColor("white").fontSize(7).text("E-PASS", qrX + 20, startY + 155, { align: "center", width: 60 });

            doc.font(fontRegular).fontSize(6).fillOpacity(0.7)
                .text("Quét mã tại cổng soát vé.", dividerX, startY + 175, { align: "center", width: cardW * 0.28 })
                .text("Hành trình xanh của bạn!", dividerX, startY + 185, { align: "center", width: cardW * 0.28 });

            // Footer branding
            doc.rect(dividerX, startY + cardH - 20, cardW * 0.28, 20).fillColor("black").fillOpacity(0.1).fill();
            doc.fillOpacity(0.4).fillColor("white").font(fontBold).fontSize(5)
                .text("ECO RAIL SERIES v2.0", dividerX, startY + cardH - 12, { align: "center", width: cardW * 0.28, characterSpacing: 1 });

            doc.restore();
            doc.end();
        } catch (err) {
            reject(err);
        }
    });
};