import nodemailer from "nodemailer";
import path from "path";

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.MAIL_PORT) || 587,
    secure: process.env.MAIL_SECURE === "true", // true for port 465
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

interface SendTicketEmailOptions {
    to: string;
    customerEmail?: string;
    bookingCode: string;
    pdfBuffer: Buffer;
}

export const sendTicketEmail = async ({
    to,
    customerEmail,
    bookingCode,
    pdfBuffer,
}: SendTicketEmailOptions): Promise<void> => {
    await transporter.sendMail({
        from: `"VéTàu System" <${process.env.MAIL_USER}>`,
        to,
        subject: `🎫 Vé điện tử của bạn - Mã đặt chỗ: ${bookingCode}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #1a73e8;">Xin chào Hành khách!</h2>
        <p>Cảm ơn bạn đã đặt vé Metro Tuyến số 5 qua hệ thống VéTàu.</p>
        <p><strong>Mã vé của bạn:</strong> <span style="font-size: 24px; color: #e53935; font-weight: bold;">${bookingCode}</span></p>
        <p>Vui lòng xem file vé đính kèm (PDF). Hãy sử dụng mã QR trên vé để check-in tại cổng soát vé nhà ga.</p>
        <hr/>
        <p style="color: #888; font-size: 12px;">Email này được gửi tự động, vui lòng không reply.</p>
      </div>
    `,
        attachments: [
            {
                filename: `ve-tau-${bookingCode}.pdf`,
                content: pdfBuffer,
                contentType: "application/pdf",
            },
        ],
    });
};

export const verifyMailConnection = async (): Promise<void> => {
    try {
        await transporter.verify();
        console.log("[Mail] SMTP connection verified successfully.");
    } catch (err) {
        console.error("[Mail] SMTP connection failed:", err);
    }
};
