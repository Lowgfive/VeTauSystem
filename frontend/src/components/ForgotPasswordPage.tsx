import { useState } from "react";
import { Train, ArrowLeft, Mail, ArrowRight } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface ForgotPasswordPageProps {
  onSendOTP: (email: string) => void;
  onNavigateToLogin: () => void;
  onNavigateToHome: () => void;
}

export function ForgotPasswordPage({
  onSendOTP,
  onNavigateToLogin,
  onNavigateToHome,
}: ForgotPasswordPageProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Vui lòng nhập email");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Email không hợp lệ");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSendOTP(email);
    }, 800);
  };

  return (
    <div className="h-screen flex relative overflow-hidden bg-gray-50 items-center justify-center p-4">
      <div className="w-full max-w-md relative z-10">
        <button
          onClick={onNavigateToHome}
          className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Trở về trang chủ</span>
        </button>

        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="p-3 bg-primary rounded-xl shadow-lg">
            <Train className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Đường Sắt Việt Nam</h1>
            <p className="text-sm text-gray-600">Hệ thống đặt vé trực tuyến</p>
          </div>
        </div>

        <Card className="p-8 shadow-2xl border-0 bg-white">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Quên mật khẩu?</h2>
            <p className="text-sm text-gray-600">
              Nhập email đã đăng ký của bạn. Chúng tôi sẽ gửi một mã xác thực (OTP) tới email này.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-900">
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
                    setError(null);
                  }}
                  className={`pl-11 h-11 text-sm border-2 transition-all ${
                    error ? "border-red-500 focus-visible:ring-red-500" : "border-gray-200 focus-visible:border-primary focus-visible:ring-primary/20"
                  }`}
                />
              </div>
              {error && (
                <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                  <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                  {error}
                </p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary-hover text-white font-semibold h-11 text-sm group shadow-lg hover:shadow-xl transition-all"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Đang xử lý...
                </div>
              ) : (
                <>
                  Gửi mã xác thực
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Nhớ mật khẩu?{" "}
              <button
                onClick={onNavigateToLogin}
                className="text-primary hover:text-primary-hover font-bold transition-colors hover:underline"
              >
                Đăng nhập
              </button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
