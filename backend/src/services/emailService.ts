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

export interface SendResetPasswordEmailOptions {
    to: string;
    resetToken: string;
    clientUrl?: string; // Optional clientUrl passed from request origin
}

export const sendResetPasswordEmail = async ({
    to,
    resetToken,
    clientUrl,
}: SendResetPasswordEmailOptions): Promise<void> => {
    // Generate a reset link pointing to the frontend
    const baseUrl = clientUrl || process.env.CLIENT_URL || "http://localhost:5173";
    const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #1a73e8; text-align: center;">Đặt Cài Đặt Mật Khẩu</h2>
        <p>Xin chào,</p>
        <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản VéTàu System liên kết với địa chỉ email này.</p>
        <p>Vui lòng nhấn vào nút bên dưới để thiết lập lại mật khẩu. Liên kết này sẽ hết hạn trong vòng 15 phút.</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Đặt lại Mật khẩu</a>
        </div>
        <p style="font-size: 14px;">Nếu nút trên không hoạt động, bạn có thể copy và dán đường link sau vào trình duyệt:</p>
        <p style="font-size: 14px; color: #555; word-break: break-all;">${resetLink}</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
        <p style="color: #888; font-size: 12px;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
      </div>
    `;

    try {
        await transporter.sendMail({
            from: `"VéTàu System" <${process.env.MAIL_USER}>`,
            to,
            subject: `🔒 Yêu cầu Đặt lại Mật khẩu - VéTàu System`,
            html: htmlContent,
        });
    } catch (error) {
        console.error("⚠️ [EmailService] Không thể gửi email. SMTP Error:", (error as Error).message);
        throw new Error("Không thể gửi email lúc này. Vui lòng thử lại sau.");
    }
};

export interface SendPasswordChangedEmailOptions {
    to: string;
    name: string;
    clientUrl?: string; // Optional clientUrl passed from request origin
}

export const sendPasswordChangedEmail = async ({
    to,
    name,
    clientUrl,
}: SendPasswordChangedEmailOptions): Promise<void> => {
    // Client URL to login back
    const baseUrl = clientUrl || process.env.CLIENT_URL || "http://localhost:5173";
    const loginLink = `${baseUrl}/login`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #1a73e8; text-align: center;">Đổi Mật Khẩu Thành Công</h2>
        <p>Xin chào <strong>${name}</strong>,</p>
        <p>Mật khẩu của tài khoản VéTàu System liên kết với email này đã được thay đổi thành công vào lúc ${new Date().toLocaleString("vi-VN")}.</p>
        <p>Bạn có thể sử dụng mật khẩu mới để đăng nhập vào hệ thống.</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="${loginLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Đăng Nhập Ngay</a>
        </div>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
        <p style="color: #888; font-size: 12px;">Nếu bạn không thực hiện hành động này, vui lòng liên hệ ngay với quản trị viên qua bộ phận Hỗ Trợ Khách Hàng để bảo vệ tài khoản.</p>
        <p style="color: #888; font-size: 12px;">Email này được gửi tự động, vui lòng không reply.</p>
      </div>
    `;

    try {
        await transporter.sendMail({
            from: `"VéTàu System" <${process.env.MAIL_USER}>`,
            to,
            subject: `✅ Thông báo: Mật khẩu đã được thay đổi`,
            html: htmlContent,
        });
    } catch (error) {
        console.error("⚠️ [EmailService] Không thể gửi email thông báo đổi mật khẩu. SMTP Error:", (error as Error).message);
    }
};

export const verifyMailConnection = async (): Promise<void> => {
    try {
        await transporter.verify();
        console.log("[Mail] SMTP connection verified successfully.");
    } catch (err) {
        console.error("[Mail] SMTP connection failed:", err);
    }
};
