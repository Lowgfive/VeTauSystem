import { useState } from "react";
import { Train, Mail, ArrowLeft } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface ForgotPasswordPageProps {
  onSubmit: (email: string) => void;
  onNavigateToLogin: () => void;
  isLoading?: boolean;
}

export function ForgotPasswordPage({
  onSubmit,
  onNavigateToLogin,
  isLoading = false,
}: ForgotPasswordPageProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();

  const validateForm = () => {
    if (!email) {
      setError("Vui lòng nhập email");
      return false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Email không hợp lệ");
      return false;
    }
    setError(undefined);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(email);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-white shadow-sm border border-gray-100 rounded-xl relative z-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-5">
            <Train className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Quên mật khẩu?</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Vui lòng nhập địa chỉ email đã đăng ký. Chúng tôi sẽ gửi liên kết để đặt lại mật khẩu cho bạn.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-gray-900">
              Email
            </Label>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <Input
                id="email"
                type="email"
                placeholder="ví dụ: admin@fpt.edu.vn"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(undefined);
                }}
                className={`pl-11 h-11 text-sm transition-all focus-visible:ring-1 focus-visible:ring-offset-0 ${
                  error
                    ? "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500"
                    : "border-gray-200 focus-visible:border-blue-600 focus-visible:ring-blue-600"
                }`}
              />
            </div>
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Đang gửi...
              </div>
            ) : (
              "Gửi yêu cầu"
            )}
          </Button>

          <button
            type="button"
            onClick={onNavigateToLogin}
            className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại Đăng nhập
          </button>
        </form>
      </Card>

      <div className="mt-8 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} VNR High-Speed Rail. Toàn bộ thông tin được bảo mật mã hóa SSL.
      </div>
    </div>
  );
}
