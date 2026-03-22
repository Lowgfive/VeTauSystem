import { useNavigate, useSearchParams } from "react-router-dom";

export default function PaymentResultPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const status = searchParams.get("status"); // success | failed | error
    const txnRef = searchParams.get("txnRef") || "";

    const isSuccess = status === "success";

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
