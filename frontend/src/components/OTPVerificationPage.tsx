import { useState, useRef, useEffect } from "react";
import { Train, ArrowLeft, ArrowRight, Lock, KeyRound } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface OTPVerificationPageProps {
    email: string;
    onVerifyOTP: (otp: string, newPassword?: string) => void;
    onNavigateToLogin: () => void;
    onResendOTP: () => void;
    mode?: "reset-password" | "register";
}

export function OTPVerificationPage({
    email,
    onVerifyOTP,
    onNavigateToLogin,
    onResendOTP,
    mode = "reset-password",
}: OTPVerificationPageProps) {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [newPassword, setNewPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [countdown, setCountdown] = useState(60);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleChange = (index: number, value: string) => {
        if (value.length > 1) {
            value = value.slice(-1);
        }
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const otpValue = otp.join("");

        if (otpValue.length < 6) {
            setError("Vui lòng nhập đầy đủ mã xác thực 6 số");
            return;
        }

        if (mode === "reset-password") {
            if (!newPassword || newPassword.length < 6) {
                setError("Mật khẩu mới phải có ít nhất 6 ký tự");
                return;
            }
        }

        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            onVerifyOTP(otpValue, newPassword);
        }, 800);
    };

    const handleResend = () => {
        setCountdown(60);
        onResendOTP();
    };

    return (
        <div className="h-screen flex relative overflow-hidden bg-gray-50 items-center justify-center p-4">
            <div className="w-full max-w-md relative z-10">
                <button
                    onClick={onNavigateToLogin}
                    className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors mb-6 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Trở về đăng nhập</span>
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
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            {mode === "register" ? "Xác thực tài khoản" : "Thực hiện đổi mật khẩu"}
                        </h2>
                        <p className="text-sm text-gray-600">
                            Vui lòng nhập mã OTP đã được gửi đến <span className="font-semibold text-gray-900">{email}</span> để
                            {mode === "register" ? " hoàn tất đăng ký." : " tạo mật khẩu mới."}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* OTP Input */}
                        <div>
                            <Label className="text-sm font-semibold text-gray-900 mb-3 block">Mã xác thực (OTP)</Label>
                            <div className="flex gap-2 justify-between">
                                {otp.map((digit, index) => (
                                    <Input
                                        key={index}
                                        ref={(el) => (inputRefs.current[index] = el)}
                                        type="text"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        className="w-12 h-14 text-center text-lg font-bold border-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
                                    />
                                ))}
                            </div>
                        </div>

                        {/* New Password Input - Only for reset-password */}
                        {mode === "reset-password" && (
                            <div className="space-y-1.5">
                                <Label htmlFor="newPassword" className="text-sm font-semibold text-gray-900">
                                    Mật khẩu mới
                                </Label>
                                <div className="relative group">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        placeholder="Nhập mật khẩu mới"
                                        value={newPassword}
                                        onChange={(e) => {
                                            setNewPassword(e.target.value);
                                            setError(null);
                                        }}
                                        className={`pl-11 h-11 text-sm border-2 transition-all ${error && error.includes("Mật khẩu")
                                            ? "border-red-500 focus-visible:ring-red-500"
                                            : "border-gray-200 focus-visible:border-primary focus-visible:ring-primary/20"
                                            }`}
                                    />
                                </div>
                            </div>
                        )}

                        {error && (
                            <p className="text-xs text-red-600 flex items-center gap-1 mt-1 -">
                                <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                                {error}
                            </p>
                        )}

                        <Button
                            type="submit"
                            size="lg"
                            disabled={isLoading || otp.join("").length < 6 || (mode === "reset-password" && !newPassword)}
                            className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary-hover hover:to-secondary-hover text-white font-semibold h-11 text-sm group shadow-lg hover:shadow-xl transition-all"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Đang xử lý...
                                </div>
                            ) : (
                                <>
                                    {mode === "register" ? "Xác nhận OTP" : "Xác nhận đặt lại mật khẩu"}
                                    <KeyRound className="w-4 h-4 ml-2 group-hover:rotate-12 transition-transform" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Không nhận được mã?{" "}
                            {countdown > 0 ? (
                                <span className="text-gray-400 font-medium">Gửi lại sau {countdown}s</span>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    className="text-primary hover:text-primary-hover font-bold transition-colors hover:underline"
                                >
                                    Gửi lại ngay
                                </button>
                            )}
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
