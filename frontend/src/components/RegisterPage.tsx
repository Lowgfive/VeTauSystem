import { useState } from "react";
import {
  Train,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
  ArrowLeft,
  Sparkles,
  Shield,
} from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { authService } from "../services/auth.service";
import { toast } from "sonner";

interface RegisterPageProps {
  onRegister: (data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
  }) => void;
  onNavigateToLogin: () => void;
  onNavigateToHome?: () => void;
}

export function RegisterPage({
  onRegister,
  onNavigateToLogin,
  onNavigateToHome,
}: RegisterPageProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.fullName) {
      newErrors.fullName = "Vui lòng nhập họ tên";
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = "Họ tên phải có ít nhất 2 ký tự";
    }

    if (!formData.email) {
      newErrors.email = "Vui lòng nhập email";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.phone) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (
      !/^(0|\+84)[0-9]{9,10}$/.test(
        formData.phone.replace(/\s/g, ""),
      )
    ) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (formData.password.length < 8) {
      newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
    } else if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(
        formData.password,
      )
    ) {
      newErrors.password =
        "Mật khẩu phải bao gồm chữ hoa, chữ thường và số";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword =
        "Mật khẩu xác nhận không khớp";
    }

    if (!acceptTerms) {
      newErrors.terms =
        "Vui lòng đồng ý với điều khoản sử dụng";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      try {
        await onRegister({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        });
      } catch (error: any) {
        // Lỗi sẽ được handle bởi Wrapper
      } finally {
        setIsLoading(false);
      }
    }
  };

  const updateField = (
    field: keyof typeof formData,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const getPasswordStrength = () => {
    const pwd = formData.password;
    if (!pwd) return { strength: 0, label: "", color: "" };

    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;

    if (strength <= 2)
      return { strength: 1, label: "Yếu", color: "bg-red-500" };
    if (strength <= 3)
      return {
        strength: 2,
        label: "Trung bình",
        color: "bg-yellow-500",
      };
    if (strength <= 4)
      return {
        strength: 3,
        label: "Mạnh",
        color: "bg-green-500",
      };
    return {
      strength: 4,
      label: "Rất mạnh",
      color: "bg-green-600",
    };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="h-screen flex relative overflow-hidden">
      {/* Right Side - Stunning Image */}
      <div className="hidden lg:block lg:w-1/2 xl:w-3/5 relative order-2">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1721274416633-468a57874793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB0cmFpbiUyMHN0YXRpb24lMjBwbGF0Zm9ybSUyMHRyYXZlbHxlbnwxfHx8fDE3NzAwMDI2MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Modern Train Station"
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-bl from-secondary/90 via-primary/85 to-primary/90"></div>
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
            <Badge className="mb-[16px] bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm text-xs mt-[7px] mr-[0px] ml-[0px]">
              <Sparkles className="w-3 h-3 mr-1" />
              Ưu đãi đặc biệt cho thành viên mới
            </Badge>

            <h2 className="text-4xl xl:text-5xl font-bold mb-4 leading-tight">
              Bắt đầu hành trình
              <br />
              <span className="text-white/90">
                của bạn ngay hôm nay
              </span>
            </h2>

            <p className="text-lg text-white/90 leading-relaxed mb-8">
              Tạo tài khoản để mở khóa những trải nghiệm đặt vé
              độc đáo và nhận ưu đãi hấp dẫn dành riêng cho bạn.
            </p>

            {/* Benefits */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  <span className="text-2xl">🎁</span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm mb-0.5">
                    Giảm 10% đơn hàng đầu tiên
                  </h3>
                  <p className="text-xs text-white/80">
                    Ưu đãi dành riêng cho thành viên mới
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  <span className="text-2xl">⚡</span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm mb-0.5">
                    Ưu tiên chọn ghế VIP
                  </h3>
                  <p className="text-xs text-white/80">
                    Quyền truy cập sớm vào ghế cao cấp
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm mb-0.5">
                    Tích điểm thưởng
                  </h3>
                  <p className="text-xs text-white/80">
                    Đổi điểm lấy vé miễn phí và quà tặng
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Left Side - Register Form */}
      <div className="flex-1 lg:w-1/2 xl:w-2/5 flex items-center justify-center px-6 py-6 bg-gradient-to-br from-gray-50 to-white relative order-1">
        {/* Decorative Elements */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-secondary/5 rounded-full blur-3xl"></div>

        <div className="w-full max-w-md relative z-10">
          {/* Back Button */}
          {onNavigateToHome && (
            <button
              onClick={onNavigateToHome}
              className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors mb-4 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">
                Trở về trang chủ
              </span>
            </button>
          )}

          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-4">
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
          <Card className="p-6 shadow-2xl border-0 bg-white">
            {/* Header */}
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Đăng ký
              </h2>
              <p className="text-sm text-gray-600">
                Tạo tài khoản mới để bắt đầu! 🚀
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-2.5">
              {/* Full Name */}
              <div className="space-y-1">
                <Label
                  htmlFor="fullName"
                  className="text-xs font-semibold text-gray-900"
                >
                  Họ và tên
                </Label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={formData.fullName}
                    onChange={(e) =>
                      updateField("fullName", e.target.value)
                    }
                    className={`pl-10 h-9 text-sm border-2 transition-all ${errors.fullName
                      ? "border-red-500 focus-visible:ring-red-500"
                      : "border-gray-200 focus-visible:border-primary focus-visible:ring-primary/20"
                      }`}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-xs text-red-600">
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Email & Phone in Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Email */}
                <div className="space-y-1">
                  <Label
                    htmlFor="email"
                    className="text-xs font-semibold text-gray-900"
                  >
                    Email
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="ten@email.com"
                      value={formData.email}
                      onChange={(e) =>
                        updateField("email", e.target.value)
                      }
                      className={`pl-10 h-9 text-sm border-2 transition-all ${errors.email
                        ? "border-red-500 focus-visible:ring-red-500"
                        : "border-gray-200 focus-visible:border-primary focus-visible:ring-primary/20"
                        }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-600">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <Label
                    htmlFor="phone"
                    className="text-xs font-semibold text-gray-900"
                  >
                    Số điện thoại
                  </Label>
                  <div className="relative group">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="0912345678"
                      value={formData.phone}
                      onChange={(e) =>
                        updateField("phone", e.target.value)
                      }
                      className={`pl-10 h-9 text-sm border-2 transition-all ${errors.phone
                        ? "border-red-500 focus-visible:ring-red-500"
                        : "border-gray-200 focus-visible:border-primary focus-visible:ring-primary/20"
                        }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-red-600">
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <Label
                  htmlFor="password"
                  className="text-xs font-semibold text-gray-900"
                >
                  Mật khẩu
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Tối thiểu 8 ký tự"
                    value={formData.password}
                    onChange={(e) =>
                      updateField("password", e.target.value)
                    }
                    className={`pl-10 pr-10 h-9 text-sm border-2 transition-all ${errors.password
                      ? "border-red-500 focus-visible:ring-red-500"
                      : "border-gray-200 focus-visible:border-primary focus-visible:ring-primary/20"
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Password Strength */}
                {formData.password && (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1 flex-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-all ${level <= passwordStrength.strength
                            ? passwordStrength.color
                            : "bg-gray-200"
                            }`}
                        />
                      ))}
                    </div>
                    <p
                      className={`text-xs font-medium whitespace-nowrap ${passwordStrength.strength === 1
                        ? "text-red-600"
                        : passwordStrength.strength === 2
                          ? "text-yellow-600"
                          : "text-green-600"
                        }`}
                    >
                      {passwordStrength.label}
                    </p>
                  </div>
                )}

                {errors.password && (
                  <p className="text-xs text-red-600">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <Label
                  htmlFor="confirmPassword"
                  className="text-xs font-semibold text-gray-900"
                >
                  Xác nhận mật khẩu
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="confirmPassword"
                    type={
                      showConfirmPassword ? "text" : "password"
                    }
                    placeholder="Nhập lại mật khẩu"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      updateField(
                        "confirmPassword",
                        e.target.value,
                      )
                    }
                    className={`pl-10 pr-10 h-9 text-sm border-2 transition-all ${errors.confirmPassword
                      ? "border-red-500 focus-visible:ring-red-500"
                      : "border-gray-200 focus-visible:border-primary focus-visible:ring-primary/20"
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword,
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {formData.confirmPassword &&
                  formData.password ===
                  formData.confirmPassword && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Mật khẩu khớp
                    </p>
                  )}
                {errors.confirmPassword && (
                  <p className="text-xs text-red-600">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Terms */}
              <div className="pt-1">
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="terms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) => {
                      setAcceptTerms(checked === true);
                      setErrors((prev) => ({
                        ...prev,
                        terms: undefined,
                      }));
                    }}
                    className="mt-0.5 border-2"
                  />
                  <Label
                    htmlFor="terms"
                    className="text-xs text-gray-700 cursor-pointer font-normal leading-relaxed"
                  >
                    Tôi đồng ý với{" "}
                    <button
                      type="button"
                      className="text-primary hover:underline font-semibold"
                    >
                      Điều khoản
                    </button>{" "}
                    và{" "}
                    <button
                      type="button"
                      className="text-primary hover:underline font-semibold"
                    >
                      Bảo mật
                    </button>
                  </Label>
                </div>
                {errors.terms && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.terms}
                  </p>
                )}
              </div>

              {/* Register Button */}
              <Button
                type="submit"
                size="lg"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary-hover text-white font-semibold h-10 text-sm group shadow-lg hover:shadow-xl transition-all mt-3"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Đang xử lý...
                  </div>
                ) : (
                  <>
                    Đăng ký ngay
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-3">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-gray-500 font-medium">
                hoặc
              </span>
            </div>

            {/* Social Registration */}
            <div className="grid grid-cols-2 gap-2.5 mb-3">
              <Button
                type="button"
                variant="outline"
                className="border-2 hover:bg-gray-50 transition-all h-9 text-xs"
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
                className="border-2 hover:bg-gray-50 transition-all h-9 text-xs"
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

            {/* Login Link */}
            <div className="text-center">
              <p className="text-xs text-gray-600">
                Đã có tài khoản?{" "}
                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  className="text-primary hover:text-primary-hover font-bold transition-colors hover:underline"
                >
                  Đăng nhập ngay
                </button>
              </p>
            </div>
          </Card>

          {/* Security Note */}
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
              <Shield className="w-3 h-3" />
              Thông tin được bảo vệ bằng mã hóa SSL 256-bit
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}