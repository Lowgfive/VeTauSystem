import { useEffect, useState } from "react";
import { walletService } from "../services/wallet.service";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Wallet, Plus, History, ArrowUpRight, ArrowDownLeft, Loader2, CreditCard, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { toast } from "sonner";

export default function WalletPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [isTopUpLoading, setIsTopUpLoading] = useState(false);

  const fetchWallet = async () => {
    try {
      const res = await walletService.getWallet();
      setData(res.data);
    } catch (error: any) {
      toast.error(error.message || "Không thể tải thông tin ví");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();

    // Check for payment result in URL
    const params = new URLSearchParams(window.location.search);
    const success = params.get("success");
    const message = params.get("message");

    if (success === "true") {
      toast.success(message || "Nạp tiền vào ví thành công!");
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (success === "false") {
      toast.error(message || "Thanh toán không thành công");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleTopUp = async () => {
    if (!topUpAmount || isNaN(Number(topUpAmount)) || Number(topUpAmount) < 10000) {
      toast.error("Vui lòng nhập số tiền hợp lệ (tối thiểu 10.000đ)");
      return;
    }

    setIsTopUpLoading(true);
    try {
      const res = await walletService.topUp(Number(topUpAmount));
      if (res.success && res.data) {
        window.location.href = res.data; // Redirect to VNPay
      }
    } catch (error: any) {
      toast.error(error.message || "Lỗi nạp tiền");
    } finally {
      setIsTopUpLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Wallet className="w-8 h-8 text-primary" />
            Ví của tôi
          </h1>
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="text-slate-500 hover:text-primary transition-colors font-semibold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại trang chủ
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Balance Card */}
          <Card className="md:col-span-1 p-6 bg-gradient-to-br from-primary to-blue-700 text-white shadow-xl overflow-hidden relative">
             <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
             <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl" />
             
             <p className="text-white/80 text-sm font-medium mb-1 uppercase tracking-wider">Số dư hiện tại</p>
             <h2 className="text-4xl font-black mb-6 tracking-tight">
               {formatCurrency(data?.wallet?.balance || 0)}
             </h2>
             <Badge className="bg-white/20 text-white border-none backdrop-blur-md">
               Vé Tàu System Card
             </Badge>
          </Card>

          {/* Top-up Card */}
          <Card className="md:col-span-2 p-6 shadow-railway-md border-2 border-slate-100">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Nạp tiền vào ví
            </h3>
            <div className="space-y-6">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="0"
                  value={topUpAmount}
                  onChange={(e) => {
                    const val = (e.target.value.replace(/\D/g, "")).slice(0, 9);
                    setTopUpAmount(val);
                  }}
                  className="block w-full pl-6 pr-24 py-6 text-4xl font-black border-4 border-slate-100 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all bg-white placeholder:text-slate-200 text-slate-900"
                  autoFocus
                />
                <div className="absolute inset-y-0 right-0 flex items-center px-5 pointer-events-none bg-slate-50 border-l-2 border-slate-100 rounded-r-2xl group-focus-within:bg-blue-50 group-focus-within:border-primary/20 transition-colors">
                  <span className="text-slate-500 font-black text-lg">VND</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[50000, 100000, 200000, 500000].map((amt) => (
                  <Button
                    key={amt}
                    variant="outline"
                    onClick={() => setTopUpAmount(amt.toString())}
                    className="py-6 border-2 border-slate-100 hover:border-primary hover:bg-blue-50 hover:text-primary transition-all rounded-xl font-bold"
                  >
                    +{amt / 1000}K
                  </Button>
                ))}
              </div>

              <Button 
                onClick={handleTopUp} 
                className="w-full py-8 font-black text-2xl shadow-2xl shadow-primary/20 hover:shadow-primary/40 transition-all bg-[#0A2A43] hover:bg-blue-900 rounded-2xl flex items-center justify-center gap-4 group"
                disabled={isTopUpLoading}
              >
                {isTopUpLoading ? <Loader2 className="w-8 h-8 animate-spin" /> : (
                  <>
                    <CreditCard className="w-7 h-7 group-hover:scale-110 transition-transform" />
                    <span>Nạp tiền ngay</span>
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>

        {/* Transaction History */}
        <Card className="p-6 shadow-railway-lg border-2 border-slate-50">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <History className="w-6 h-6 text-primary" />
            Lịch sử giao dịch
          </h3>
          
          <div className="space-y-4">
            {data?.transactions?.length > 0 ? (
              data.transactions.map((tx: any) => (
                <div key={tx._id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${
                      tx.type === "deposit" || tx.type === "refund" 
                        ? "bg-green-100 text-green-700" 
                        : "bg-red-100 text-red-700"
                    }`}>
                      {tx.type === "deposit" || tx.type === "refund" ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{tx.description}</p>
                      <p className="text-xs text-slate-500 font-medium">
                        {new Date(tx.createdAt).toLocaleString("vi-VN")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-black ${
                      tx.type === "deposit" || tx.type === "refund" ? "text-green-600" : "text-red-600"
                    }`}>
                      {tx.type === "deposit" || tx.type === "refund" ? "+" : "-"}{formatCurrency(tx.amount)}
                    </p>
                    <Badge variant={tx.status === "success" ? "default" : tx.status === "pending" ? "secondary" : "destructive"} className="text-[10px] h-5">
                      {tx.status === "success" ? "Thành công" : tx.status === "pending" ? "Chờ xử lý" : "Thất bại"}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400">
                <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="font-medium italic">Chưa có giao dịch nào</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
