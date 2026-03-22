import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../hooks/useRedux";
import { loginSuccess } from "../store/slices/authSlice";
import { RegisterPage } from "../components/RegisterPage";
import { OTPVerificationPage } from "../components/OTPVerificationPage";
import { apiClient } from "../config/api";
import { toast } from "sonner";

export default function RegisterPageWrapper() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [step, setStep] = useState<1 | 2>(1);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const handleRegister = async (data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    try {
      // Register
      const res = await apiClient.post("/auth/register", {
        name: data.fullName,
        email: data.email,
        password: data.password,
      });

      setRegisteredEmail(data.email);
      setStep(2);
      toast.success(res.data?.message || "Đăng ký thành công! Vui lòng kiểm tra mã OTP trong email.");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Đăng ký thất bại";
      toast.error(msg);
    }
  };

  const handleVerifyOTP = async (otp: string) => {
    try {
      const res = await apiClient.post("/auth/verify-register-otp", {
        email: registeredEmail,
        otp,
      });
      const { token, user } = res.data.data;
      dispatch(loginSuccess({ token, user }));
      toast.success("Xác thực OTP thành công! Chào mừng bạn.");
      navigate("/");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Xác thực OTP thất bại";
      toast.error(msg);
    }
  };

  const handleResendOTP = async () => {
    try {
      const res = await apiClient.post("/auth/resend-register-otp", {
        email: registeredEmail,
      });
      toast.success(res.data.message || "Mã OTP đã được gửi lại");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Gửi lại OTP thất bại");
    }
  };

  if (step === 2) {
    return (
      <OTPVerificationPage
        mode="register"
        email={registeredEmail}
        onVerifyOTP={handleVerifyOTP}
        onNavigateToLogin={() => navigate("/login")}
        onResendOTP={handleResendOTP}
      />
    );
  }

  return (
    <RegisterPage
      onRegister={handleRegister}
      onNavigateToLogin={() => navigate("/login")}
      onNavigateToHome={() => navigate("/")}
    />
  );
}
