import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../store";
import { updateBalance } from "../store/slices/authSlice";
import { getBalance, deposit, getTransactions, createDepositPayment } from "../services/wallet.service";
import { 
  Wallet, 
  Plus, 
  History, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCcw,
  CreditCard,
  ShieldCheck,
  TrendingUp,
  Receipt,
  Clock,
  Smartphone,
  Banknote,
  Globe,
  Loader2,
  Home
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { toast } from "sonner";

interface Transaction {
  _id: string;
  amount: number;
  type: "deposit" | "payment" | "refund" | "adjustment";
  description: string;
  status: "pending" | "completed" | "failed";
  createdAt: string;
}

const WalletPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [selectedMethod, setSelectedMethod] = useState<string>("vnpay");

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const balanceRes = await getBalance();
      dispatch(updateBalance(balanceRes.data.balance));

      const transRes = await getTransactions();
      setTransactions(transRes.data);
    } catch (error: any) {
      toast.error("Lỗi khi tải dữ liệu ví: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeposit = async () => {
    const amount = parseInt(depositAmount);
    if (isNaN(amount) || amount < 10000) {
      toast.warning("Số tiền nạp tối thiểu là 10,000đ");
      return;
    }

    setLoading(true);
    try {
      // In a real app, different methods might call different endpoints or pass params
      // For now, all methods go through VNPay logic but could be differentiated
      const res = await createDepositPayment(amount);
      
      if (res.success && res.data.paymentUrl) {
        toast.info("Đang chuyển hướng đến cổng thanh toán...");
        window.location.href = res.data.paymentUrl;
      } else {
        throw new Error("Không nhận được link thanh toán");
      }
    } catch (error: any) {
      toast.error("Lỗi khi tạo giao dịch: " + (error.response?.data?.message || error.message));
      setLoading(false);
    }
  };
   
  const handleSimulateInstantDeposit = async () => {
    // Hidden feature for testing only
    const amount = parseInt(depositAmount);
    if (isNaN(amount)) return;
    setLoading(true);
    try {
      const res = await deposit(amount);
      dispatch(updateBalance(res.data.balance));
      setDepositAmount("");
      toast.success("Nạp tiền (thử nghiệm) thành công!");
      fetchData();
    } catch (error: any) {
      toast.error("Nạp tiền thất bại");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amt);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit": return <Plus className="text-success h-4 w-4" />;
      case "payment": return <ArrowUpRight className="text-destructive h-4 w-4" />;
      case "refund": return <ArrowDownLeft className="text-blue-500 h-4 w-4" />;
      default: return <RefreshCcw className="text-gray-500 h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Wallet className="h-8 w-8 text-primary" />
            </div>
            Ví Của Tôi
          </h1>
          <p className="text-gray-500 mt-1 font-medium">Quản lý số dư và lịch sử giao dịch đường sắt</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="rounded-full shadow-sm hover:shadow-md transition-all gap-2"
          >
            <Home className="h-4 w-4" />
            Trang chủ
          </Button>
          <Button 
            variant="outline" 
            onClick={() => fetchData(true)} 
            disabled={refreshing}
            className="rounded-full shadow-sm hover:shadow-md transition-all gap-2"
          >
            <RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Balance & Deposit */}
        <div className="lg:col-span-5 space-y-8">
          {/* Balance Card - Premium Design */}
          <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-primary via-primary/90 to-secondary text-white relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <CreditCard className="h-32 w-32 rotate-12" />
            </div>
            <CardHeader className="relative z-10 pb-0">
              <CardTitle className="text-white/80 font-medium text-sm flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Số dư hiện tại
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 py-8">
              <div className="text-5xl font-extrabold tracking-tighter">
                {formatCurrency(user?.balance || 0)}
              </div>
              <div className="mt-6 flex items-center gap-2">
                <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0 py-1 px-3">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Đã xác thực
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Deposit Card */}
          <Card className="border-2 border-primary/10 shadow-xl overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Nạp tiền vào ví
              </CardTitle>
              <CardDescription>Tiền nạp sẽ được sử dụng để thanh toán vé và phí đổi vé</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Số tiền muốn nạp (VND)</label>
                  <div className="relative">
                    <Input 
                      type="number" 
                      placeholder="VD: 100000" 
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="h-14 text-xl font-bold border-2 focus:border-primary pl-4 pr-12 rounded-xl"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">đ</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[50000, 100000, 200000, 500000, 1000000].map((amt) => (
                    <Button 
                      key={amt}
                      variant="outline" 
                      size="sm"
                      onClick={() => setDepositAmount(amt.toString())}
                      className="text-xs border-dashed hover:border-primary hover:text-primary transition-all rounded-lg"
                    >
                      +{amt/1000}k
                    </Button>
                  ))}
                </div>
                <div className="space-y-3 pt-2">
                  <label className="text-sm font-semibold text-gray-700">Chọn phương thức thanh toán</label>
                  
                  <div 
                    onClick={() => setSelectedMethod("vnpay")}
                    className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedMethod === "vnpay" ? "border-primary bg-primary/5 shadow-md" : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${selectedMethod === "vnpay" ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}`}>
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-sm">VNPay QR</div>
                      <div className="text-[10px] text-gray-500">Thanh toán qua ứng dụng ngân hàng</div>
                    </div>
                    {selectedMethod === "vnpay" && <Badge className="bg-primary">Chọn</Badge>}
                  </div>

                  <div 
                    onClick={() => setSelectedMethod("atm")}
                    className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedMethod === "atm" ? "border-primary bg-primary/5 shadow-md" : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${selectedMethod === "atm" ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}`}>
                      <Banknote className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-sm">Thẻ ATM / Tài khoản ngân hàng</div>
                      <div className="text-[10px] text-gray-500">Hỗ trợ tất cả ngân hàng nội địa</div>
                    </div>
                    {selectedMethod === "atm" && <Badge className="bg-primary">Chọn</Badge>}
                  </div>

                  <div 
                    onClick={() => setSelectedMethod("intl")}
                    className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedMethod === "intl" ? "border-primary bg-primary/5 shadow-md" : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${selectedMethod === "intl" ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}`}>
                      <Globe className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-sm">Thẻ quốc tế</div>
                      <div className="text-[10px] text-gray-500">Visa, Mastercard, JCB, American Express</div>
                    </div>
                    {selectedMethod === "intl" && <Badge className="bg-primary">Chọn</Badge>}
                  </div>
                </div>

                <Button 
                  className="w-full h-14 text-lg font-bold shadow-lg hover:shadow-xl transition-all rounded-xl mt-4" 
                  onClick={handleDeposit}
                  disabled={loading || !depositAmount}
                >
                  {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CreditCard className="mr-2 h-5 w-5" />}
                  Xác nhận nạp tiền
                </Button>
                <p className="text-[10px] text-center text-gray-400 italic">
                  * Hệ thống sẽ chuyển đến cổng thanh toán an toàn để thực hiện giao dịch.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - History */}
        <div className="lg:col-span-7">
          <Card className="h-full border-2 border-gray-100 shadow-xl overflow-hidden flex flex-col">
            <CardHeader className="bg-gray-50/50 border-b shrink-0">
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5 text-secondary" />
                Lịch sử giao dịch
              </CardTitle>
              <CardDescription>Danh sách các giao dịch nạp, thanh toán và hoàn tiền gần nhất</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto pt-4 p-0">
              {transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <Receipt className="h-16 w-16 mb-4 opacity-20" />
                  <p className="font-medium text-lg">Chưa có giao dịch nào</p>
                  <p className="text-sm">Thực hiện nạp tiền hoặc đặt vé để thấy lịch sử</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {transactions.map((trans) => (
                    <div key={trans._id} className="p-5 hover:bg-gray-50 transition-all flex items-center gap-4 group">
                      <div className={`p-3 rounded-2xl shrink-0 transition-transform group-hover:scale-110 ${
                        trans.type === 'deposit' ? 'bg-success/10' : 
                        trans.type === 'payment' ? 'bg-destructive/10' : 
                        trans.type === 'refund' ? 'bg-blue-500/10' : 'bg-gray-100'
                      }`}>
                        {getTransactionIcon(trans.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-gray-900 truncate pr-4">{trans.description}</h4>
                          <div className={`font-bold text-lg whitespace-nowrap ${
                            trans.amount > 0 ? "text-success" : "text-destructive"
                          }`}>
                            {trans.amount > 0 ? "+" : ""}{formatCurrency(trans.amount).replace('₫', 'đ')}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-medium text-gray-500">
                          <span className="flex items-center gap-1 uppercase">
                            <Badge variant="outline" className="text-[10px] font-bold py-0 h-4 border-gray-300">
                              {trans.type}
                            </Badge>
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(trans.createdAt).toLocaleString("vi-VN")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
