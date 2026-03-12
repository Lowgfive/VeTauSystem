import { useState } from "react";
import { Train, ArrowLeft, Lock, Eye, EyeOff } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface ResetPasswordPageProps {
  onSubmit: (password: string) => void;
  onNavigateToLogin: () => void;
  isLoading?: boolean;
}

export function ResetPasswordPage({
  onSubmit,
  onNavigateToLogin,
  isLoading = false,
}: ResetPasswordPageProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [errors, setErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!newPassword) {
      newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(newPassword);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-white shadow-sm border border-gray-100 rounded-xl relative z-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-5">
            <Train className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Đặt lại mật khẩu mới</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Vui lòng tạo mật khẩu mới cho tài khoản của bạn.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-sm font-semibold text-gray-900">
              Mật khẩu mới
            </Label>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu mới..."
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, newPassword: undefined }));
                }}
                className={`pl-11 pr-11 h-11 text-sm transition-all focus-visible:ring-1 focus-visible:ring-offset-0 ${
                  errors.newPassword
                    ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500"
                    : "border-gray-200 focus-visible:border-blue-600 focus-visible:ring-blue-600"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.newPassword && <p className="text-xs text-red-600 mt-1">{errors.newPassword}</p>}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-900">
              Xác nhận mật khẩu
            </Label>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Nhập lại mật khẩu..."
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }}
                className={`pl-11 pr-11 h-11 text-sm transition-all focus-visible:ring-1 focus-visible:ring-offset-0 ${
                  errors.confirmPassword
                    ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500"
                    : "border-gray-200 focus-visible:border-blue-600 focus-visible:ring-blue-600"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors mt-6"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Đang cập nhật...
              </div>
            ) : (
              "Cập nhật mật khẩu"
            )}
          </Button>

          <button
            type="button"
            onClick={onNavigateToLogin}
            className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors mt-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay về Đăng nhập
          </button>
        </form>
      </Card>

      <div className="mt-8 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} VNR High-Speed Rail. Toàn bộ thông tin được bảo mật mã hóa SSL.
      </div>
    </div>
  );
}
