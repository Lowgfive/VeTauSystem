import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ResetPasswordPage } from "../components/ResetPasswordPage";
import { apiClient } from "../config/api";
import { toast } from "sonner";

export default function ResetPasswordPageWrapper() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);

  // If no token, maybe we just show generic error or redirect.
  // We'll let the user see the page, but the API will block them.

  const handleSubmit = async (newPassword: string) => {
    if (!token) {
      toast.error("Đường dẫn này không hợp lệ hoặc đã thiếu token bảo mật.");
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post("/auth/reset-password", {
        token,
        newPassword,
      });
      toast.success("Mật khẩu đã được cập nhật thành công.");
      // Navigate back to login
      navigate("/login");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Token không hợp lệ hoặc đã hết hạn.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ResetPasswordPage
      onSubmit={handleSubmit}
      onNavigateToLogin={() => navigate("/login")}
      isLoading={isLoading}
    />
  );
}
