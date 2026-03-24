import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../config/api";
import { toast } from "sonner";
import {
  Train,
  ArrowLeft,
  CreditCard,
  Shield,
  Lock,
  CheckCircle,
  Clock,
  Calendar,
  Loader2,
  Ticket,
} from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Checkbox } from "./ui/checkbox";

interface SeatData {
  seat_id: string;
  seat_number?: string;
  full_name: string;
  id_number: string;
  dob?: string;
  gender?: string;
  passenger_type?: string;
  ticket_price: number;
  base_price?: number;
  insurance?: number;
  discount_rate?: number;
}

interface BookingDataType {
  scheduleId: string;
  trainCode: string;
  trainName: string;
  route: { origin: string; destination: string };
  date: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  seats: SeatData[];
  totalPrice: number;
  departureStationId?: string;
  arrivalStationId?: string;
}

interface PaymentPageProps {
  onBack: () => void;
  bookingData?: BookingDataType | BookingDataType[];
}

const PENDING_PAYMENT_KEY = 'pending_payment';
const PAYMENT_RETURN_NOTICE_KEY = "payment_return_notice";

const buildBookingSignature = (bookings: BookingDataType[]) =>
  bookings
    .map((booking) =>
      [
        booking.scheduleId,
        ...(booking.seats || []).map((seat) => seat.seat_id).sort(),
      ].join(':')
    )
    .join('|');

export function PaymentPage({ onBack, bookingData }: PaymentPageProps) {
  const navigate = useNavigate();
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const bookings: BookingDataType[] = bookingData
    ? (Array.isArray(bookingData) ? bookingData : [bookingData])
    : [];

  const grandTotal = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleDateString("vi-VN");
  };

  const handleCancelPayment = () => {
    sessionStorage.removeItem(PENDING_PAYMENT_KEY);
    sessionStorage.setItem(PAYMENT_RETURN_NOTICE_KEY, "1");
    onBack();
  };

  const handlePayment = async () => {
    if (!acceptTerms) {
      toast.error("Vui lòng đồng ý với điều khoản và điều kiện");
      return;
    }

    if (bookings.length === 0 || bookings.some((b) => !b.scheduleId)) {
      toast.error("Dữ liệu đặt vé không hợp lệ. Vui lòng quay lại và thử lại.");
      return;
    }

    setIsProcessing(true);

    try {
      const signature = buildBookingSignature(bookings);
      const pendingRaw = sessionStorage.getItem(PENDING_PAYMENT_KEY);

      if (pendingRaw) {
        try {
          const pending = JSON.parse(pendingRaw) as {
            signature?: string;
            paymentUrl?: string;
            bookingIds?: string[];
          };

          if (pending.signature === signature && pending.paymentUrl) {
            window.location.href = pending.paymentUrl;
            return;
          }
        } catch {
          sessionStorage.removeItem(PENDING_PAYMENT_KEY);
        }
      }

      // 1. Create booking(s) in backend
      const createdIds: string[] = [];

      for (const b of bookings) {
        const res = await apiClient.post("/bookings/create", {
          scheduleId: b.scheduleId,
          totalAmount: b.totalPrice,
          seats: b.seats.map((s) => ({
            seat_id: s.seat_id,
            full_name: s.full_name,
            id_number: s.id_number,
            dob: s.dob,
            gender: s.gender || "Unknown",
            ticket_price: s.ticket_price,
            passenger_type: s.passenger_type || "Người lớn",
            discount_rate: s.discount_rate || 0,
            base_price: s.base_price || s.ticket_price,
            insurance: s.insurance || 0,
          })),
          departureStationId: b.departureStationId,
          arrivalStationId: b.arrivalStationId,
        });

        if (!res.data?.success) {
          throw new Error(res.data?.message || "Tạo booking thất bại");
        }
        createdIds.push(res.data.data.booking._id);
      }

      // 2. Request VNPay payment URL
      const payRes = await apiClient.post("/payments/create-payment", {
        booking_ids: createdIds,
      });

      if (!payRes.data?.success) {
        throw new Error(payRes.data?.message || "Không thể tạo giao dịch thanh toán");
      }

      const paymentUrl = payRes.data.data.paymentUrl;

      sessionStorage.setItem(
        PENDING_PAYMENT_KEY,
        JSON.stringify({
          signature,
          bookingIds: createdIds,
          paymentUrl,
          txnRef: payRes.data.data.txnRef,
          createdAt: Date.now(),
        })
      );

      // 3. Redirect to VNPay
      window.location.href = paymentUrl;
    } catch (err: any) {
      console.error(err);
      if (err?.response?.status === 409) {
        toast.error(
          err?.response?.data?.message ||
            'Ghế đã hết giữ chỗ hoặc đã được tạo đơn trước đó. Vui lòng quay lại chọn ghế hoặc tiếp tục thanh toán từ lần trước.'
        );
      } else {
        toast.error(err.message || "Đã có lỗi xảy ra. Vui lòng thử lại.");
      }
      setIsProcessing(false);
    }
  };

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Ticket className="w-16 h-16 text-gray-300" />
        <h2 className="text-xl font-bold text-gray-700">Không có thông tin đặt vé</h2>
        <p className="text-gray-500">Vui lòng quay lại và chọn ghế trước khi thanh toán.</p>
        <Button onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              Quay lại
            </button>
            <h1 className="text-xl font-bold text-gray-900">Thanh toán</h1>
          </div>
          <button
            onClick={handleCancelPayment}
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
          >
            Hủy thanh toán
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Payment method */}
          <div className="lg:col-span-2 space-y-6">
            {/* VNPay card */}
            <Card className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Phương thức thanh toán
              </h2>
              <div className="flex items-center gap-4 p-4 border-2 border-primary bg-primary/5 rounded-xl">
                <div className="p-3 rounded-xl bg-primary text-white">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">VNPay</div>
                  <div className="text-sm text-gray-500">
                    Thanh toán qua cổng VNPay – ATM, thẻ tín dụng, QR Code
                  </div>
                </div>
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
            </Card>

            {/* Terms & Submit */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={acceptTerms}
                    onCheckedChange={(v: boolean | "indeterminate") => setAcceptTerms(v === true)}
                    className="mt-1"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
                    Tôi đồng ý với{" "}
                    <a href="#" className="text-primary hover:underline font-semibold">
                      điều khoản và điều kiện
                    </a>{" "}
                    của Đường Sắt Việt Nam.
                  </label>
                </div>

                <Separator />

                <Button
                  onClick={handlePayment}
                  disabled={!acceptTerms || isProcessing}
                  size="lg"
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-xl"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5 mr-2" />
                      Thanh toán {formatPrice(grandTotal)}
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-4 pt-1">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Shield className="w-4 h-4 text-green-600" />
                    Bảo mật SSL
                  </div>
                  <div className="w-px h-4 bg-gray-200" />
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Mã hóa 256-bit
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right: Booking summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h3 className="font-bold text-xl text-gray-900 mb-6 flex items-center gap-2">
                <Ticket className="w-6 h-6 text-primary" />
                Tóm tắt vé
              </h3>

              <div className="space-y-4 mb-6">
                {bookings.map((b, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-100"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-primary rounded-lg flex-shrink-0">
                        <Train className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm">
                          {bookings.length > 1 ? (idx === 0 ? "Chiều đi:" : "Chiều về:") : ""}{" "}
                          {b.trainCode}
                        </div>
                        <div className="text-xs text-gray-500">
                          {b.route?.origin} → {b.route?.destination}
                        </div>
                      </div>
                    </div>

                    <Separator className="my-3 bg-blue-200" />

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> Ngày đi
                        </span>
                        <span className="font-semibold">{formatDate(b.date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Giờ khởi hành
                        </span>
                        <span className="font-semibold">{b.departureTime || "N/A"}</span>
                      </div>
                      <div className="flex justify-between items-start mt-2 pt-2 border-t border-blue-200">
                        <span className="text-gray-500 text-xs">
                          Ghế:{" "}
                          {b.seats?.map((s) => s.seat_number || s.seat_id).join(", ")}
                        </span>
                        <span className="font-semibold text-primary text-sm">
                          {formatPrice(b.totalPrice || 0)}
                        </span>
                      </div>
                      {/* Passengers */}
                      <div className="pt-1 space-y-1">
                        {b.seats?.map((s, i) => (
                          <div key={i} className="text-xs text-gray-600 flex justify-between">
                            <span>{s.full_name}</span>
                            <span className="text-gray-400">{s.passenger_type || "Người lớn"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-bold text-gray-900">Tổng thanh toán</span>
                <span className="text-2xl font-bold text-primary">{formatPrice(grandTotal)}</span>
              </div>

              <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-green-700">
                    Mọi giao dịch được mã hóa và bảo mật tuyệt đối
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
