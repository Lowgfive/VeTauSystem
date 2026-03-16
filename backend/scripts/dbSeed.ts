import "../src/config/env";
import bcrypt from "bcrypt";
import UserModel from "../src/models/user.model";
import { UserRole } from "../src/types/auth.type";
import { connectDatabase, disconnectDatabase } from "../src/config/db";

async function seedAdmin() {
    try {
        await connectDatabase();
        console.log("✅ Kết nối Database thành công. Đang kiểm tra tài khoản Admin...");

        // Kiểm tra xem đã có admin nào chưa
        const existingAdmin = await UserModel.findOne({ role: UserRole.ADMIN });
        
        // Cố gắng xóa index cũ "username_1" nếu còn sót lại từ schema cũ
        try {
            await UserModel.collection.dropIndex("username_1");
            console.log("Đã xóa index cũ 'username_1' thành công.");
        } catch (err: any) {
            // Có thể bỏ qua nếu index không tồn tại
        }

        if (existingAdmin) {
            console.log("⚠️ Đã tồn tại tài khoản Admin trong hệ thống:");
            console.log(`   - Email: ${existingAdmin.email}`);
            console.log("   Không tạo thêm tài khoản Admin mới.");
            return;
        }

        console.log("⏳ Không tìm thấy Admin. Đang tạo tài khoản mặc định...");
        
        const adminEmail = "admin@vetau.com";
        const adminPassword = "AdminPassword123"; // Mật khẩu mặc định
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        const newAdmin = await UserModel.create({
            name: "Hệ thống Admin",
            email: adminEmail,
            password: hashedPassword,
            phone: "0123456789",
            role: UserRole.ADMIN,
        });

        console.log("🎉 Khởi tạo tài khoản Admin thành công!");
        console.log(`   - Email:    ${newAdmin.email}`);
        console.log(`   - Password: ${adminPassword}`);
        console.log("⚠️ Vui lòng đổi mật khẩu sau khi đăng nhập thành công.");

    } catch (error) {
        console.error("❌ Lỗi khi khởi tạo dữ liệu:", error);
    } finally {
        await disconnectDatabase();
        console.log("Đã đóng kết nối Database.");
        process.exit(0);
    }
}

seedAdmin();
