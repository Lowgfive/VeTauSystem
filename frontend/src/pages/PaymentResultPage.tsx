import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { toast } from "sonner";
import { clearMyLocks } from "../utils/mySeatLocks";

const PENDING_PAYMENT_KEY = 'pending_payment';
const CART_KEYS_TO_CLEAR = [
    'selectedDeparture',
    'selectedReturn',
    'outboundSeats',
    'returnSeats',
];

export default function PaymentResultPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { clearCart } = useCartStore();

    const status = searchParams.get("status"); // success | failed | error
    const txnRef = searchParams.get("txnRef") || "";

    const isSuccess = status === "success";

    useEffect(() => {
        if (isSuccess) {
            clearCart();
            sessionStorage.removeItem(PENDING_PAYMENT_KEY);
            CART_KEYS_TO_CLEAR.forEach((key) => sessionStorage.removeItem(key));
            clearMyLocks();
            toast.success(`Thanh toán thành công! Mã giao dịch: ${txnRef}`);
            // Đưa về home sau một chút để user kịp thấy popup thành công
            setTimeout(() => {
                navigate("/", { replace: true });
            }, 1500);
        } else if (status === "failed" || status === "error") {
            sessionStorage.removeItem(PENDING_PAYMENT_KEY);
        }
    }, [isSuccess, status, clearCart, txnRef, navigate]);

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-xl">
                    <div className="text-6xl mb-4">✅</div>
                    <h1 className="text-2xl font-bold text-green-600 mb-2">
                        Thanh toán thành công!
                    </h1>
                    <p className="text-gray-500 mb-6">Đang chuyển hướng về trang chủ...</p>
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-xl">
                {isSuccess ? (
                    <>
                        <div className="text-6xl mb-4">✅</div>
                        <h1 className="text-2xl font-bold text-green-600 mb-2">
                            Thanh toán thành công!
                        </h1>
                        <p className="text-gray-500 mb-2">
                            Mã giao dịch:{" "}
                            <span className="font-bold text-blue-600">{txnRef}</span>
                        </p>
                        <p className="text-sm text-gray-400 mb-6">
                            Vé điện tử đã được xác nhận. Vui lòng kiểm tra lịch sử vé của bạn.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => navigate("/manage")}
                                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                            >
                                Xem vé của tôi
                            </button>
                            <button
                                onClick={() => navigate("/")}
                                className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                            >
                                Về trang chủ
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="text-6xl mb-4">❌</div>
                        <h1 className="text-2xl font-bold text-red-600 mb-2">
                            Thanh toán thất bại
                        </h1>
                        <p className="text-gray-500 mb-6">
                            Giao dịch không thành công. Vui lòng thử lại.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => navigate(-1)}
                                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                            >
                                Thử lại
                            </button>
                            <button
                                onClick={() => navigate("/")}
                                className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                            >
                                Về trang chủ
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
