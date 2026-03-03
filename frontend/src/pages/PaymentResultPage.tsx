// Page: kết quả sau thanh toán VNPAY redirect về
const PaymentResultPage = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const status = searchParams.get("vnp_ResponseCode");
    const bookingCode = searchParams.get("vnp_TxnRef") || "";

    const isSuccess = status === "00";

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center max-w-md p-8">
                {isSuccess ? (
                    <>
                        <div className="text-6xl mb-4">✅</div>
                        <h1 className="text-2xl font-bold text-green-600 mb-2">Thanh toán thành công!</h1>
                        <p className="text-muted-foreground mb-2">
                            Mã đặt chỗ: <span className="font-bold text-blue-600 text-lg">{bookingCode}</span>
                        </p>
                        <p className="text-sm text-muted-foreground mb-6">
                            Vé điện tử đã được gửi vào email của bạn.
                        </p>
                    </>
                ) : (
                    <>
                        <div className="text-6xl mb-4">❌</div>
                        <h1 className="text-2xl font-bold text-red-600 mb-2">Thanh toán thất bại</h1>
                        <p className="text-muted-foreground mb-6">
                            Giao dịch không thành công. Vui lòng thử lại.
                        </p>
                    </>
                )}
                <a
                    href="/"
                    className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    Về trang chủ
                </a>
            </div>
        </div>
    );
};

export default PaymentResultPage;
