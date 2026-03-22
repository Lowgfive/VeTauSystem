import nodemailer from "nodemailer";
import path from "path";

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === "true", // true for port 465
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
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
        from: `"VéTàu System" <${process.env.EMAIL_USER}>`,
        to,
        subject: `🎫 Vé điện tử của bạn - Mã đặt chỗ: ${bookingCode}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2 style="color: #1a73e8;">Xin chào Hành khách!</h2>
        <p>Cảm ơn bạn đã đặt vé qua hệ thống VéTàu.</p>
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
            from: `"VéTàu System" <${process.env.EMAIL_USER}>`,
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
            from: `"VéTàu System" <${process.env.EMAIL_USER}>`,
            to,
            subject: `✅ Thông báo: Mật khẩu đã được thay đổi`,
            html: htmlContent,
        });
    } catch (error) {
        console.error("⚠️ [EmailService] Không thể gửi email thông báo đổi mật khẩu. SMTP Error:", (error as Error).message);
    }
};

export interface SendRegisterOtpEmailOptions {
    to: string;
    otp: string;
    name: string;
}

export const sendRegisterOtpEmail = async ({
    to,
    otp,
    name,
}: SendRegisterOtpEmailOptions): Promise<void> => {
    const htmlContent = `
      <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 32px 24px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">ĐƯỜNG SẮT VIỆT NAM</h1>
            <p style="margin: 8px 0 0; color: #bfdbfe; font-size: 14px;">Hệ thống vé tàu điện tử thông minh</p>
        </div>
        
        <div style="padding: 40px 32px;">
            <h2 style="margin: 0 0 20px; color: #1e293b; font-size: 20px; text-align: center; font-weight: 600;">Xác Thực Email Đăng Ký</h2>
            <p style="margin: 0 0 16px; color: #334155; font-size: 16px; line-height: 1.6;">Xin chào <strong>${name}</strong>,</p>
            <p style="margin: 0 0 24px; color: #334155; font-size: 16px; line-height: 1.6;">Cảm ơn bạn đã lựa chọn dịch vụ của Đường Sắt Việt Nam. Để đảm bảo an toàn, vui lòng sử dụng mã bảo mật dưới đây để hoàn tất việc đăng ký tài khoản của bạn:</p>
            
            <div style="background-color: #f1f5f9; border: 2px dashed #93c5fd; border-radius: 12px; padding: 24px; text-align: center; margin: 32px 0;">
                <span style="display: inline-block; font-family: monospace; font-size: 40px; font-weight: 700; color: #1d4ed8; letter-spacing: 12px; margin-left: 12px;">${otp}</span>
            </div>
            
            <p style="margin: 0 0 24px; color: #64748b; font-size: 14px; text-align: center;">
                ⏳ Mã xác thực này có hiệu lực trong vòng <strong>5 phút</strong>.
            </p>
            
            <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 6px; margin-bottom: 8px;">
                <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.5;">
                    <strong>Lưu ý bảo mật:</strong> Tuyệt đối không chia sẻ mã OTP này cho bất kỳ ai. Nhân viên Đường Sắt Việt Nam sẽ không bao giờ yêu cầu bạn cung cấp mã này.
                </p>
            </div>
        </div>
        
        <div style="background-color: #f8fafc; padding: 24px 32px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="margin: 0 0 8px; color: #64748b; font-size: 12px;">Nếu bạn không yêu cầu tạo tài khoản, xin vui lòng bỏ qua email này.</p>
            <p style="margin: 0; color: #94a3b8; font-size: 12px;">&copy; ${new Date().getFullYear()} VéTàu System. Trân trọng,</p>
        </div>
      </div>
    `;

    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log(`\n==================================================`);
            console.log(`🟢 [DEV MODE] OTP for ${to}: ${otp}`);
            console.log(`⚠️ EMAIL_USER/PASS not configured. Skipping email send.`);
            console.log(`==================================================\n`);
            return;
        }

        await transporter.sendMail({
            from: `"VéTàu System" <${process.env.EMAIL_USER}>`,
            to,
            subject: `Mã xác nhận (OTP) đăng ký tài khoản VéTàu System`,
            html: htmlContent,
        });
    } catch (error) {
        console.error("⚠️ [EmailService] Không thể gửi email OTP đăng ký. SMTP Error:", (error as Error).message);
        // In development, don't crash if email fails
        if (process.env.NODE_ENV !== "production") {
            console.log(`🟢 [DEV MODE] Email failed but continuing... OTP was: ${otp}`);
            return;
        }
        throw new Error("Không thể gửi mã OTP tới email của bạn. Vui lòng kiểm tra lại địa chỉ email.");
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
