import { useState } from "react";
import {
  Train,
  ArrowLeft,
  CreditCard,
  Smartphone,
  QrCode,
  Shield,
  Lock,
  CheckCircle,
  AlertCircle,
  Clock,
  MapPin,
  User,
  Calendar,
  Ticket,
  ChevronRight,
  Info,
  Loader2,
  Wallet,
} from "lucide-react";
import { walletService } from "../services/wallet.service";
import { toast } from "sonner";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Checkbox } from "./ui/checkbox";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";

interface PaymentPageProps {
  onBack?: () => void;
  onPaymentSuccess?: () => void;
  bookingData?: {
    trainCode: string;
    trainName: string;
    route: {
      origin: string;
      destination: string;
    };
    date: string;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    seats: string[];
    passengers: {
      name: string;
      id: string;
      phone: string;
    }[];
    totalPrice: number;
  };
}

import { useNavigate } from "react-router-dom";

export function PaymentPage({ onBack, onPaymentSuccess, bookingData }: PaymentPageProps) {
  const navigate = useNavigate();
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };
  const [paymentMethod, setPaymentMethod] = useState("qr");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [cardData, setCardData] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  useState(() => {
    const fetchBalance = async () => {
      try {
        const res = await walletService.getWallet();
        if (res.success) {
          setWalletBalance(res.data.wallet.balance);
        }
      } catch (error) {
        console.error("Failed to fetch wallet balance", error);
      }
    };
    fetchBalance();
  });

  // Mock booking data if not provided
  const booking = bookingData || {
    trainCode: "SE1",
    trainName: "Thống Nhất",
    route: {
      origin: "Hà Nội",
      destination: "Sài Gòn",
    },
    date: "2026-02-15",
    departureTime: "19:00",
    arrivalTime: "04:30",
    duration: "30h 30m",
    seats: ["A12", "A13"],
    passengers: [
      { name: "Nguyễn Văn A", id: "001234567890", phone: "0987654321" },
      { name: "Trần Thị B", id: "001234567891", phone: "0987654322" },
    ],
    totalPrice: 1900000,
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const paymentMethods = [
    {
      id: "qr",
      name: "Quét mã QR",
      icon: QrCode,
      description: "VNPay, MoMo, ZaloPay",
      badge: "Nhanh nhất",
      badgeColor: "bg-green-100 text-green-800",
    },
    {
      id: "card",
      name: "Thẻ ATM/Tín dụng",
      icon: CreditCard,
      description: "Visa, MasterCard, JCB",
      badge: "Phổ biến",
      badgeColor: "bg-blue-100 text-blue-800",
    },
    {
      id: "ewallet",
      name: "Ví điện tử",
      icon: Smartphone,
      description: "MoMo, ZaloPay, VNPay",
      badge: "Ưu đãi 5%",
      badgeColor: "bg-orange-100 text-orange-800",
    },
    {
      id: "wallet",
      name: "Ví của tôi",
      icon: Wallet,
      description: `Số dư: ${walletBalance !== null ? formatPrice(walletBalance) : "Đang tải..."}`,
      badge: walletBalance !== null && walletBalance >= booking.totalPrice ? "Sẵn sàng" : "Nạp thêm",
      badgeColor: walletBalance !== null && walletBalance >= booking.totalPrice ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800",
    },
  ];

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(" ") : cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, "");
    if (/^\d{0,16}$/.test(value)) {
      setCardData({ ...cardData, number: value });
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length >= 2) {
      value = value.slice(0, 2) + "/" + value.slice(2, 4);
    }
    setCardData({ ...cardData, expiry: value });
  };

  const handlePayment = () => {
    if (!acceptTerms) {
      alert("Vui lòng đồng ý với điều khoản và điều kiện");
      return;
    }

    setIsProcessing(true);

    if (paymentMethod === "wallet") {
      // Wallet payment logic
      const handleWalletPayment = async () => {
        try {
          const res = await walletService.payWithWallet((booking as any)._id || "mock-id");
          if (res.success) {
            setIsProcessing(false);
            setShowSuccessModal(true);
            setTimeout(() => {
              if (onPaymentSuccess) onPaymentSuccess();
            }, 2000);
          } else {
            throw new Error(res.message);
          }
        } catch (error: any) {
          setIsProcessing(false);
          toast.error(error.message || "Lỗi thanh toán bằng ví");
        }
      };
      handleWalletPayment();
      return;
    }

    // Simulate other payment methods
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccessModal(true);
      
      // Call success callback after 2 seconds
      setTimeout(() => {
        if (onPaymentSuccess) {
          onPaymentSuccess();
        }
      }, 2000);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-primary text-white shadow-railway-lg z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 shadow-lg">
                <Train className="w-7 h-7 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-xl leading-tight tracking-tight">
                  Đường Sắt Việt Nam
                </h1>
                <p className="text-xs text-white/90 font-medium">
                  Thanh Toán An Toàn
                </p>
              </div>
            </div>

            {/* Security Badge */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-lg border border-white/30">
                <Shield className="w-5 h-5 text-white" />
                <span className="text-sm font-semibold">Bảo mật SSL</span>
              </div>
              <Button
                onClick={onBack}
                variant="secondary"
                size="sm"
                className="bg-white text-primary hover:bg-white/90 font-bold shadow-lg"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: Payment Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Payment Method Selection */}
                <Card className="p-6">
                  <h3 className="font-bold text-xl text-gray-900 mb-6 flex items-center gap-2">
                    <CreditCard className="w-6 h-6 text-primary" />
                    Chọn phương thức thanh toán
                  </h3>

                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="space-y-3">
                      {paymentMethods.map((method) => (
                        <label
                          key={method.id}
                          className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            paymentMethod === method.id
                              ? "border-primary bg-primary/5 shadow-lg"
                              : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                          }`}
                        >
                          <RadioGroupItem value={method.id} id={method.id} />
                          <div className="flex items-center gap-4 flex-1">
                            <div
                              className={`p-3 rounded-xl ${
                                paymentMethod === method.id
                                  ? "bg-primary text-white"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              <method.icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-900">
                                  {method.name}
                                </span>
                                {method.badge && (
                                  <Badge className={method.badgeColor}>
                                    {method.badge}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">
                                {method.description}
                              </p>
                            </div>
                            {paymentMethod === method.id && (
                              <CheckCircle className="w-6 h-6 text-primary" />
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </RadioGroup>
                </Card>

                {/* Payment Details */}
                <Card className="p-6">
                  <h3 className="font-bold text-xl text-gray-900 mb-6 flex items-center gap-2">
                    <Lock className="w-6 h-6 text-primary" />
                    Thông tin thanh toán
                  </h3>

                  {paymentMethod === "qr" && (
                    <div className="text-center py-8">
                      <div className="w-64 h-64 bg-white border-4 border-gray-200 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-xl">
                        <div className="text-center">
                          <QrCode className="w-48 h-48 text-gray-300 mx-auto mb-4" />
                          <p className="text-sm text-gray-500">
                            Mã QR sẽ hiện sau khi xác nhận
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-4 mb-4">
                        <img
                          src="https://via.placeholder.com/60x60?text=MoMo"
                          alt="MoMo"
                          className="w-12 h-12 rounded-lg border-2 border-gray-200"
                        />
                        <img
                          src="https://via.placeholder.com/60x60?text=ZaloPay"
                          alt="ZaloPay"
                          className="w-12 h-12 rounded-lg border-2 border-gray-200"
                        />
                        <img
                          src="https://via.placeholder.com/60x60?text=VNPay"
                          alt="VNPay"
                          className="w-12 h-12 rounded-lg border-2 border-gray-200"
                        />
                      </div>
                      <p className="text-sm text-gray-600">
                        Quét mã QR bằng ứng dụng MoMo, ZaloPay hoặc VNPay
                      </p>
                    </div>
                  )}

                  {paymentMethod === "card" && (
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="card-number" className="text-gray-700 font-semibold mb-2 block">
                          Số thẻ *
                        </Label>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="card-number"
                            required
                            value={formatCardNumber(cardData.number)}
                            onChange={handleCardNumberChange}
                            placeholder="1234 5678 9012 3456"
                            className="pl-10 h-12 border-2 text-lg tracking-wider"
                            maxLength={19}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="card-name" className="text-gray-700 font-semibold mb-2 block">
                          Tên chủ thẻ *
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            id="card-name"
                            required
                            value={cardData.name}
                            onChange={(e) =>
                              setCardData({ ...cardData, name: e.target.value.toUpperCase() })
                            }
                            placeholder="NGUYEN VAN A"
                            className="pl-10 h-12 border-2 uppercase"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="card-expiry" className="text-gray-700 font-semibold mb-2 block">
                            Ngày hết hạn *
                          </Label>
                          <Input
                            id="card-expiry"
                            required
                            value={cardData.expiry}
                            onChange={handleExpiryChange}
                            placeholder="MM/YY"
                            className="h-12 border-2 text-lg"
                            maxLength={5}
                          />
                        </div>

                        <div>
                          <Label htmlFor="card-cvv" className="text-gray-700 font-semibold mb-2 block">
                            CVV *
                          </Label>
                          <Input
                            id="card-cvv"
                            required
                            type="password"
                            value={cardData.cvv}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "");
                              if (value.length <= 3) {
                                setCardData({ ...cardData, cvv: value });
                              }
                            }}
                            placeholder="123"
                            className="h-12 border-2 text-lg"
                            maxLength={3}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                        <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <p className="text-sm text-blue-900">
                          Thông tin thẻ được mã hóa SSL 256-bit. Chúng tôi không lưu trữ thông tin thẻ của bạn.
                        </p>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "ewallet" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        {["MoMo", "ZaloPay", "VNPay"].map((wallet) => (
                          <button
                            key={wallet}
                            className="p-6 border-2 border-gray-200 rounded-xl hover:border-primary hover:shadow-lg transition-all"
                          >
                            <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                              <Smartphone className="w-8 h-8 text-gray-600" />
                            </div>
                            <p className="font-semibold text-sm text-gray-900">
                              {wallet}
                            </p>
                          </button>
                        ))}
                      </div>

                      <div className="p-6 bg-orange-50 border-2 border-orange-200 rounded-xl text-center">
                        <Badge className="bg-orange-500 text-white mb-3">
                          Ưu đãi đặc biệt
                        </Badge>
                        <p className="font-bold text-lg text-orange-900 mb-1">
                          Giảm 5% khi thanh toán qua ví điện tử
                        </p>
                        <p className="text-sm text-orange-700">
                          Áp dụng cho đơn hàng từ 500.000đ
                        </p>
                      </div>
                    </div>
                  )}
                </Card>

                {/* Terms and Submit */}
                <Card className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="terms"
                        checked={acceptTerms}
                        onCheckedChange={(checked: boolean) => setAcceptTerms(checked)}
                        className="mt-1"
                      />
                      <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
                        Tôi đồng ý với{" "}
                        <a href="#" className="text-primary hover:underline font-semibold">
                          điều khoản và điều kiện
                        </a>{" "}
                        của Đường Sắt Việt Nam. Tôi xác nhận rằng thông tin đã cung cấp là chính xác.
                      </label>
                    </div>

                    {paymentMethod === "wallet" && walletBalance !== null && walletBalance < booking.totalPrice && (
                      <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>
                          <p className="font-bold text-red-900 text-sm">Số dư không đủ</p>
                          <p className="text-xs text-red-700">Vui lòng nạp thêm {formatPrice(booking.totalPrice - walletBalance)} để thanh toán.</p>
                          <Button 
                            variant="link" 
                            className="p-0 h-auto text-xs text-red-800 font-bold underline mt-1"
                            onClick={() => window.location.href = "/wallet"}
                          >
                            Nạp tiền ngay
                          </Button>
                        </div>
                      </div>
                    )}

                    <Separator />

                    <Button
                      onClick={handlePayment}
                      disabled={!acceptTerms || isProcessing}
                      size="lg"
                      className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-xl h-14 text-lg font-bold"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <Lock className="w-5 h-5 mr-2" />
                          {paymentMethod === "wallet" ? "Thanh toán bằng Ví" : `Thanh toán ${formatPrice(booking.totalPrice)}`}
                        </>
                      )}
                    </Button>

                    <div className="flex items-center justify-center gap-4 pt-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Shield className="w-4 h-4 text-green-600" />
                        <span>Bảo mật SSL</span>
                      </div>
                      <div className="w-px h-4 bg-gray-300"></div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>PCI DSS</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right: Booking Summary */}
              <div className="lg:col-span-1">
                <Card className="p-6 sticky top-24">
                  <h3 className="font-bold text-xl text-gray-900 mb-6 flex items-center gap-2">
                    <Ticket className="w-6 h-6 text-primary" />
                    Thông tin đặt vé
                  </h3>

                  {/* Train Info */}
                  <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-primary rounded-lg">
                        <Train className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">
                          {booking.trainCode} - {booking.trainName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {booking.route.origin} → {booking.route.destination}
                        </p>
                      </div>
                    </div>

                    <Separator className="my-3 bg-blue-300" />

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Ngày đi
                        </span>
                        <span className="font-semibold">
                          {new Date(booking.date).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Giờ khởi hành
                        </span>
                        <span className="font-semibold">{booking.departureTime}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Thời gian</span>
                        <span className="font-semibold">{booking.duration}</span>
                      </div>
                    </div>
                  </div>

                  {/* Seats */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Ghế đã chọn</h4>
                    <div className="flex flex-wrap gap-2">
                      {booking.seats.map((seat) => (
                        <Badge
                          key={seat}
                          className="bg-primary/10 text-primary border-primary px-3 py-1 text-sm font-bold"
                        >
                          {seat}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Passengers */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Hành khách</h4>
                    <div className="space-y-2">
                      {booking.passengers.map((passenger, index) => (
                        <div
                          key={index}
                          className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <p className="font-semibold text-sm text-gray-900">
                            {passenger.name}
                          </p>
                          <p className="text-xs text-gray-600">CMND: {passenger.id}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="my-6" />

                  {/* Price Breakdown */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        Giá vé ({booking.seats.length} ghế)
                      </span>
                      <span className="font-semibold">
                        {formatPrice(booking.totalPrice)}
                      </span>
                    </div>
                    {paymentMethod === "ewallet" && booking.totalPrice >= 500000 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-green-600">Giảm giá (5%)</span>
                        <span className="font-semibold text-green-600">
                          -{formatPrice(booking.totalPrice * 0.05)}
                        </span>
                      </div>
                    )}
                  </div>

                  <Separator className="my-6" />

                  {/* Total */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-lg font-bold text-gray-900">
                      Tổng thanh toán
                    </span>
                    <span className="text-2xl font-bold text-primary">
                      {paymentMethod === "ewallet" && booking.totalPrice >= 500000
                        ? formatPrice(booking.totalPrice * 0.95)
                        : formatPrice(booking.totalPrice)}
                    </span>
                  </div>

                  {/* Security Info */}
                  <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm text-green-900 mb-1">
                          Thanh toán an toàn
                        </p>
                        <p className="text-xs text-green-700">
                          Mọi giao dịch được mã hóa và bảo mật tuyệt đối
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              <div className="inline-flex items-center justify-center p-4 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Thanh toán thành công!</h3>
            </DialogTitle>
            <DialogDescription className="text-center">
              <p className="text-gray-600 mb-6">
                Vé của bạn đã được xác nhận và gửi về email. Mã đặt vé của bạn là:
              </p>
              <div className="p-4 bg-primary/10 rounded-xl border-2 border-primary/20 mb-6">
                <p className="text-3xl font-bold text-primary tracking-wider">
                  VR{Math.random().toString(36).substring(2, 10).toUpperCase()}
                </p>
              </div>
              <p className="text-sm text-gray-600">
                Vui lòng kiểm tra email để nhận vé điện tử và thông tin chi tiết.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button
              onClick={() => setShowSuccessModal(false)}
              variant="outline"
              className="flex-1"
            >
              Đóng
            </Button>
            <Button
              onClick={() => {
                setShowSuccessModal(false);
                if (onPaymentSuccess) onPaymentSuccess();
              }}
              className="flex-1 bg-gradient-to-r from-primary to-secondary"
            >
              Xem vé
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
