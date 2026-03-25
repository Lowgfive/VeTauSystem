import { useEffect, useState } from 'react';
import { Card } from '../ui/card';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Ticket,
  Train,
  DollarSign,
  Activity,
  Calendar,
  RefreshCcw,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Area, AreaChart,
} from 'recharts';
import { fetchDashboardData, DashboardData } from '../../services/dashboard.service';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

const formatShortCurrency = (value: number) => {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} tỷ`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)} tr`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return value.toString();
};

export function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    fetchDashboardData()
      .then(setData)
      .catch((err) => console.error('Dashboard fetch error:', err))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => { loadData(); }, []);

  if (loading || !data) {
    return (
      <div className="space-y-6 p-2">
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-80 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Doanh thu tháng',
      value: formatCurrency(data.stats.revenueThisMonth),
      change: '+12.5%',
      trend: 'up' as const,
      icon: DollarSign,
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      bgLight: '#ecfdf5',
      textColor: '#059669',
    },
    {
      title: 'Vé đã bán',
      value: new Intl.NumberFormat('vi-VN').format(data.stats.ticketsSold),
      change: '+8.2%',
      trend: 'up' as const,
      icon: Ticket,
      gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      bgLight: '#eff6ff',
      textColor: '#2563eb',
    },
    {
      title: 'Tàu hoạt động',
      value: data.stats.activeTrains.toString(),
      change: '0%',
      trend: 'up' as const,
      icon: Train,
      gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      bgLight: '#f5f3ff',
      textColor: '#7c3aed',
    },
    {
      title: 'Hành khách',
      value: new Intl.NumberFormat('vi-VN').format(data.stats.totalPassengers),
      change: '+15.3%',
      trend: 'up' as const,
      icon: Users,
      gradient: 'linear-gradient(135deg, #fbbf24, #d97706)',
      bgLight: '#fffbeb',
      textColor: '#d97706',
    },
    {
      title: 'Tỷ lệ lấp đầy',
      value: data.stats.occupancyRate,
      change: '+2.1%',
      trend: 'up' as const,
      icon: Activity,
      gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
      bgLight: '#fef2f2',
      textColor: '#dc2626',
    },
  ];

  const { revenueChart, routeDistribution, seatTypeRevenue, recentBookings } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Bảng điều khiển
          </h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Tổng quan hệ thống — {new Date().toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm disabled:opacity-50"
        >
          <RefreshCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Đang tải...' : 'Làm mới'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const isPositive = stat.trend === 'up';

          return (
            <Card key={stat.title} className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg"
                    style={{ background: stat.gradient }}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full"
                    style={{ backgroundColor: stat.bgLight, color: stat.textColor }}
                  >
                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{stat.value}</h3>
                <p className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wider">{stat.title}</p>
              </div>
              {/* Decorative gradient bar at bottom */}
              <div
                className="h-1 w-full"
                style={{ background: stat.gradient }}
              />
            </Card>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Area Chart — wider */}
        <Card className="lg:col-span-2 border-0 shadow-md">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Biến động doanh thu</h3>
                <p className="text-sm text-gray-500">6 tháng gần nhất</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500" /> Doanh thu</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500" /> Số vé</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueChart}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <YAxis tickFormatter={(v) => formatShortCurrency(v)} tick={{ fontSize: 11 }} stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  formatter={(value: number, name: string) => [
                    name === 'revenue' ? formatCurrency(value) : value,
                    name === 'revenue' ? 'Doanh thu' : 'Số vé'
                  ]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                <Line type="monotone" dataKey="tickets" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Route Distribution Pie */}
        <Card className="border-0 shadow-md">
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Phân bổ tuyến đường</h3>
            <p className="text-sm text-gray-500 mb-4">Theo doanh thu</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={routeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="revenue"
                >
                  {routeDistribution.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div className="mt-2 space-y-1.5 max-h-[120px] overflow-y-auto">
              {routeDistribution.slice(0, 5).map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-gray-600 truncate max-w-[160px]">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    {item.name}
                  </span>
                  <span className="font-semibold text-gray-800">{item.value} vé</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Ticket Sales Bar */}
        <Card className="border-0 shadow-md">
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Lượng vé giao dịch</h3>
            <p className="text-sm text-gray-500 mb-4">Theo tháng</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={revenueChart} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <YAxis tick={{ fontSize: 11 }} stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="tickets" name="Số vé" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Seat Type Revenue */}
        <Card className="border-0 shadow-md">
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Doanh thu theo loại ghế</h3>
            <p className="text-sm text-gray-500 mb-4">Phân loại chỗ ngồi</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={seatTypeRevenue} layout="vertical" barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => formatShortCurrency(v)} tick={{ fontSize: 11 }} stroke="#9CA3AF" />
                <YAxis type="category" dataKey="type" tick={{ fontSize: 11 }} stroke="#9CA3AF" width={100} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Bar dataKey="revenue" name="Doanh thu" fill="#8B5CF6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card className="border-0 shadow-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Đặt vé gần đây</h3>
              <p className="text-sm text-gray-500">5 giao dịch mới nhất</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 font-semibold text-xs text-gray-500 uppercase tracking-wider">Mã vé</th>
                  <th className="text-left py-3 px-4 font-semibold text-xs text-gray-500 uppercase tracking-wider">Tuyến đường</th>
                  <th className="text-left py-3 px-4 font-semibold text-xs text-gray-500 uppercase tracking-wider">Hành khách</th>
                  <th className="text-left py-3 px-4 font-semibold text-xs text-gray-500 uppercase tracking-wider">Ngày</th>
                  <th className="text-left py-3 px-4 font-semibold text-xs text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="text-right py-3 px-4 font-semibold text-xs text-gray-500 uppercase tracking-wider">Giá tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentBookings.map((booking, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="text-sm font-mono font-semibold text-blue-600">{booking.id}</span>
                    </td>
                    <td className="py-3.5 px-4 text-sm text-gray-700">{booking.route}</td>
                    <td className="py-3.5 px-4 text-left">
                      <div className="flex items-center justify-start gap-3">
                        <div className="w-8 h-8 rounded-full flex-shrink-0 bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold">
                          {booking.passenger.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-gray-700">{booking.passenger}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-sm text-gray-500">{booking.date}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${booking.status === 'confirmed' || booking.status === 'paid'
                        ? 'bg-emerald-50 text-emerald-700'
                        : booking.status === 'pending'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-red-50 text-red-700'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${booking.status === 'confirmed' || booking.status === 'paid'
                          ? 'bg-emerald-500'
                          : booking.status === 'pending'
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                          }`} />
                        {booking.status === 'confirmed' ? 'Xác nhận' : booking.status === 'paid' ? 'Đã TT' : booking.status === 'pending' ? 'Chờ xử lý' : 'Đã hủy'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-sm text-right font-semibold text-gray-900">
                      {formatCurrency(booking.amount)}
                    </td>
                  </tr>
                ))}
                {recentBookings.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">Chưa có giao dịch nào.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}
