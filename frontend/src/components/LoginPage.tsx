import { useState } from "react";
import {
  Train,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Shield,
  Zap,
  MapPin,
} from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";

interface LoginPageProps {
  onLogin: (
    email: string,
    password: string,
    rememberMe: boolean,
  ) => void;
  onNavigateToRegister: () => void;
  onForgotPassword: () => void;
  onNavigateToHome?: () => void;
}

export function LoginPage({
  onLogin,
  onNavigateToRegister,
  onForgotPassword,
  onNavigateToHome,
}: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        onLogin(email, password, rememberMe);
      }, 800);
    }
  };

  return (
    <div className="h-screen flex relative overflow-hidden">
      {/* Left Side - Stunning Image */}
      <div className="hidden lg:block lg:w-1/2 xl:w-3/5 relative">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1584950632963-a5c3e38e7230?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYWlsd2F5JTIwdHJhY2tzJTIwc3Vuc2V0JTIwYmVhdXRpZnVsJTIwbGFuZHNjYXBlfGVufDF8fHx8MTc3MDAwMjYxNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Railway Journey"
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-secondary/90"></div>
        </div>

        {/* Content Overlay */}
        <div className="relative h-full flex flex-col justify-between p-10 xl:p-12 text-white z-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 shadow-xl">
              <Train className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                Đường Sắt Việt Nam
              </h1>
              <p className="text-xs text-white/90">
                Hệ thống đặt vé trực tuyến
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-xl">
            <Badge className="mb-4 bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              Đặt vé dễ dàng - Di chuyển tiện lợi
            </Badge>

            <h2 className="text-4xl xl:text-5xl font-bold mb-4 leading-tight">
              Khám phá Việt Nam
              <br />
              <span className="text-white/90">
                trên đường ray
              </span>
            </h2>

            <p className="text-lg text-white/90 leading-relaxed mb-8">
              Đăng nhập để trải nghiệm dịch vụ đặt vé tàu trực
              tuyến hiện đại, nhanh chóng và an toàn nhất Việt
              Nam.
            </p>

            {/* Feature Highlights */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mx-auto mb-2 border border-white/30">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <p className="font-semibold text-white text-sm mb-0.5">
                  3 phút
                </p>
                <p className="text-xs text-white/80">
                  Đặt vé nhanh
                </p>
              </div>

              <div className="text-center">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mx-auto mb-2 border border-white/30">
                  <MapPin className="w-7 h-7 text-white" />
                </div>
                <p className="font-semibold text-white text-sm mb-0.5">
                  100%
                </p>
                <p className="text-xs text-white/80">
                  Chọn chỗ ngồi
                </p>
              </div>

              <div className="text-center">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mx-auto mb-2 border border-white/30">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <p className="font-semibold text-white text-sm mb-0.5">
                  SSL
                </p>
                <p className="text-xs text-white/80">
                  Bảo mật cao
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8">
            <div>
              <div className="text-3xl font-bold text-white mb-0.5">
                500K+
              </div>
              <div className="text-xs text-white/80">
                Khách hàng tin dùng
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-0.5">
                1M+
              </div>
              <div className="text-xs text-white/80">
                Vé đã đặt thành công
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-0.5">
                4.9★
              </div>
              <div className="text-xs text-white/80">
                Đánh giá trung bình
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 lg:w-1/2 xl:w-2/5 flex items-center justify-center px-6 py-8 bg-gradient-to-br from-gray-50 to-white relative">
        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-secondary/5 rounded-full blur-3xl"></div>

        <div className="w-full max-w-md relative z-10">
          {/* Back Button */}
          {onNavigateToHome && (
            <button
              onClick={onNavigateToHome}
              className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors mb-6 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">
                Trở về trang chủ
              </span>
            </button>
          )}

          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-primary rounded-xl shadow-lg">
              <Train className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Đường Sắt Việt Nam
              </h1>
              <p className="text-xs text-gray-600">
                Hệ thống đặt vé trực tuyến
              </p>
            </div>
          </div>

          {/* Main Card */}
          <Card className="p-8 shadow-2xl border-0 bg-white">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Đăng nhập
              </h2>
              <p className="text-sm text-gray-600">
                Chào mừng bạn quay trở lại! 👋
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-sm font-semibold text-gray-900"
                >
                  Email
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="ten@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors((prev) => ({
                        ...prev,
                        email: undefined,
                      }));
                    }}
                    className={`pl-11 h-11 text-sm border-2 transition-all ${
                      errors.email
                        ? "border-red-500 focus-visible:ring-red-500"
                        : "border-gray-200 focus-visible:border-primary focus-visible:ring-primary/20"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="password"
                  className="text-sm font-semibold text-gray-900"
                >
                  Mật khẩu
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu của bạn"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors((prev) => ({
                        ...prev,
                        password: undefined,
                      }));
                    }}
                    className={`pl-11 pr-11 h-11 text-sm border-2 transition-all ${
                      errors.password
                        ? "border-red-500 focus-visible:ring-red-500"
                        : "border-gray-200 focus-visible:border-primary focus-visible:ring-primary/20"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) =>
                      setRememberMe(checked === true)
                    }
                    className="border-2"
                  />
                  <Label
                    htmlFor="remember"
                    className="text-xs text-gray-700 cursor-pointer font-normal"
                  >
                    Ghi nhớ đăng nhập
                  </Label>
                </div>
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-xs text-primary hover:text-primary-hover font-semibold transition-colors hover:underline"
                >
                  Quên mật khẩu?
                </button>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                size="lg"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary-hover text-white font-semibold h-11 text-sm group shadow-lg hover:shadow-xl transition-all mt-5"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Đang xử lý...
                  </div>
                ) : (
                  <>
                    Đăng nhập
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-5">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-gray-500 font-medium">
                hoặc
              </span>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <Button
                type="button"
                variant="outline"
                className="border-2 hover:bg-gray-50 transition-all h-10 text-xs"
                onClick={() =>
                  alert("Chức năng đang phát triển")
                }
              >
                <svg
                  className="w-4 h-4 mr-1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-2 hover:bg-gray-50 transition-all h-10 text-xs"
                onClick={() =>
                  alert("Chức năng đang phát triển")
                }
              >
                <svg
                  className="w-4 h-4 mr-1.5"
                  fill="#1877F2"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </Button>
            </div>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-xs text-gray-600">
                Chưa có tài khoản?{" "}
                <button
                  type="button"
                  onClick={onNavigateToRegister}
                  className="text-primary hover:text-primary-hover font-bold transition-colors hover:underline"
                >
                  Đăng ký ngay
                </button>
              </p>
            </div>
          </Card>

          {/* Footer Note */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500 leading-relaxed">
              Bằng việc đăng nhập, bạn đồng ý với{" "}
              <button className="text-primary hover:underline font-medium">
                Điều khoản
              </button>{" "}
              và{" "}
              <button className="text-primary hover:underline font-medium">
                Bảo mật
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}