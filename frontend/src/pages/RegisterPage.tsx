import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../hooks/useRedux";
import { loginSuccess } from "../store/slices/authSlice";
import { RegisterPage } from "../components/RegisterPage";
import { apiClient } from "../config/api";
import { toast } from "sonner";

export default function RegisterPageWrapper() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleRegister = async (data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    try {
      // Register
      await apiClient.post("/auth/register", {
        name: data.fullName,
        email: data.email,
        password: data.password,
      });

      // Auto-login after register
      const loginRes = await apiClient.post("/auth/login", {
        email: data.email,
        password: data.password,
      });
      const { token, user } = loginRes.data.data;
      dispatch(loginSuccess({ token, user }));
      toast.success("Đăng ký thành công! Chào mừng bạn!");
      navigate("/");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Đăng ký thất bại";
      toast.error(msg);
    }
  };

  return (
    <RegisterPage
      onRegister={handleRegister}
      onNavigateToLogin={() => navigate("/login")}
      onNavigateToHome={() => navigate("/")}
    />
  );
}
