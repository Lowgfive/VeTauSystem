import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../hooks/useRedux";
import { loginSuccess } from "../store/slices/authSlice";
import { LoginPage } from "../components/LoginPage";
import { apiClient } from "../config/api";
import { toast } from "sonner";

export default function LoginPageWrapper() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogin = async (email: string, password: string, _rememberMe: boolean) => {
    try {
      const res = await apiClient.post("/auth/login", { email, password });
      const { token, user } = res.data.data;
      dispatch(loginSuccess({ token, user }));
      toast.success("Đăng nhập thành công!");
      
      // Delay navigation to ensure Redux state is updated
      setTimeout(() => {
        const role = user.role?.toLowerCase();
        console.log("Login successful. User role:", user.role, "Normalized:", role);
        if (role === "admin") {
          console.log("Redirecting to /admin");
          navigate("/admin");
        } else {
          console.log("Redirecting to /");
          navigate("/");
        }
      }, 100);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Email hoặc mật khẩu không đúng";
      toast.error(msg);
    }
  };

  return (
    <LoginPage
      onLogin={handleLogin}
      onNavigateToRegister={() => navigate("/register")}
      onForgotPassword={() => navigate("/forgot-password")}
      onNavigateToHome={() => navigate("/")}
    />
  );
}
