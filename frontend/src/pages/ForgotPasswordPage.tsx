import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ForgotPasswordPage } from "../components/ForgotPasswordPage";
import { apiClient } from "../config/api";
import { toast } from "sonner";

export default function ForgotPasswordPageWrapper() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (email: string) => {
    setIsLoading(true);
    try {
      await apiClient.post("/auth/forgot-password", { email });
      toast.success("Nếu email tồn tại, chúng tôi đã gửi hướng dẫn tới hộp thư của bạn.");
      // Optional: Navigate back to login immediately or let user read the toast
      // navigate("/login");
    } catch (err: any) {
      // In a real app we might not want to expose if an email exists or not to prevent user enumeration.
      // But based on the backend msg it's generic enough.
      const msg = err?.response?.data?.message || "Đã có lỗi xảy ra. Vui lòng thử lại sau";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ForgotPasswordPage
      onSubmit={handleSubmit}
      onNavigateToLogin={() => navigate("/login")}
      isLoading={isLoading}
    />
  );
}
