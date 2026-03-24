import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  Wallet, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCcw,
  Download,
  Calendar,
  User,
  ExternalLink,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { walletService } from '../../services/wallet.service';
import { toast } from 'sonner';

export function AdminWalletManagement() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    search: ''
  });

  const fetchStats = async () => {
    try {
      const res = await walletService.getAdminStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch admin wallet stats:', error);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await walletService.getAllTransactions({
        page,
        limit: 10,
        type: filters.type,
        status: filters.status,
        search: filters.search
      });
      if (res.success) {
        setTransactions(res.data.transactions);
        setTotal(res.data.total);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      toast.error('Không thể tải danh sách giao dịch');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchTransactions();
  }, [page, filters.type, filters.status]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowDownLeft className="w-4 h-4 text-blue-500" />;
      case 'payment': return <ArrowUpRight className="w-4 h-4 text-orange-500" />;
      case 'refund': return <RefreshCcw className="w-4 h-4 text-purple-500" />;
      default: return <Wallet className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Giao dịch Ví</h1>
          <p className="text-muted-foreground mt-1">Theo dõi dòng tiền và lịch sử giao dịch toàn hệ thống</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Xuất báo cáo (CSV)
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Tổng số dư hệ thống</span>
            <Wallet className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold">{stats ? formatPrice(stats.totalSystemBalance) : '---'}</div>
          <p className="text-xs text-muted-foreground mt-1">Tổng tiền hiện có trong tất cả ví</p>
        </Card>

        <Card className="p-6 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Tổng nạp (Thành công)</span>
            <ArrowDownLeft className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold">
            {stats?.stats?.find((s: any) => s._id === 'deposit')?.totalAmount ? formatPrice(stats.stats.find((s: any) => s._id === 'deposit').totalAmount) : '0 ₫'}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Tổng dòng tiền nạp vào qua VNPay</p>
        </Card>

        <Card className="p-6 border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Tổng chi (Thanh toán vé)</span>
            <ArrowUpRight className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-2xl font-bold">
            {stats?.stats?.find((s: any) => s._id === 'payment')?.totalAmount ? formatPrice(stats.stats.find((s: any) => s._id === 'payment').totalAmount) : '0 ₫'}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Tổng giá trị vé đã thanh toán qua ví</p>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card className="p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Tìm theo Email user hoặc Mã giao dịch..." 
              className="pl-10"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>
          
          <select 
            className="px-3 py-2 border rounded-md text-sm min-w-[150px]"
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
          >
            <option value="">Tất cả loại giao dịch</option>
            <option value="deposit">Nạp tiền</option>
            <option value="payment">Thanh toán vé</option>
            <option value="refund">Hoàn tiền</option>
          </select>

          <select 
            className="px-3 py-2 border rounded-md text-sm min-w-[150px]"
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="success">Thành công</option>
            <option value="pending">Chờ xử lý</option>
            <option value="failed">Thất bại</option>
          </select>

          <Button type="submit">Lọc</Button>
          <Button type="button" variant="ghost" onClick={() => {
            setFilters({type: '', status: '', search: ''});
            setPage(1);
          }}>Xóa lọc</Button>
        </form>
      </Card>

      {/* Transactions Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-700 uppercase tracking-wider">Người dùng</th>
                <th className="px-6 py-4 font-semibold text-gray-700 uppercase tracking-wider">Giao dịch</th>
                <th className="px-6 py-4 font-semibold text-gray-700 uppercase tracking-wider text-right">Số tiền</th>
                <th className="px-6 py-4 font-semibold text-gray-700 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-4 font-semibold text-gray-700 uppercase tracking-wider">Mã VNPay / Booking</th>
                <th className="px-6 py-4 font-semibold text-gray-700 uppercase tracking-wider">Thời gian</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
                    <p className="text-muted-foreground">Đang tải dữ liệu...</p>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Wallet className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-900 font-medium">Không tìm thấy giao dịch nào</p>
                    <p className="text-muted-foreground text-xs mt-1">Điều chỉnh bộ lọc của bạn để thấy nhiều kết quả hơn</p>
                  </td>
                </tr>
              ) : (
                transactions.map((txn) => {
                  const user = txn.wallet_id?.user_id;
                  return (
                    <tr key={txn._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user?.name || 'Unknown User'}</p>
                            <p className="text-xs text-muted-foreground">{user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(txn.type)}
                          <span className="capitalize">{txn.type === 'deposit' ? 'Nạp tiền' : txn.type === 'payment' ? 'Đặt vé' : 'Hoàn tiền'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-bold">
                        <span className={txn.type === 'deposit' ? 'text-green-600' : 'text-orange-600'}>
                          {txn.type === 'deposit' ? '+' : '-'}{formatPrice(txn.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusClass(txn.status)}`}>
                          {getStatusIcon(txn.status)}
                          {txn.status === 'success' ? 'Thành công' : txn.status === 'failed' ? 'Thất bại' : 'Đang xử lý'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">
                        {txn.vnpay_txn_ref || txn.booking_id || '---'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(txn.createdAt).toLocaleString('vi-VN')}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="icon">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {total > 10 && (
          <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Hiển thị {(page - 1) * 10 + 1} - {Math.min(page * 10, total)} trong tổng số {total} giao dịch
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                Trang trước
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                disabled={page * 10 >= total}
                onClick={() => setPage(p => p + 1)}
              >
                Trang sau
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
