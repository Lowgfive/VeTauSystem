import { Card } from '../ui/card';
import { TrendingUp, TrendingDown, Users, Ticket, Train, DollarSign } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { getDashboardStats } from '../../services/dashboard.service';
import { Loader2 } from 'lucide-react';

export function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getDashboardStats();
        if (res.success) {
          setData(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center p-12">
        <p className="text-red-500">Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.</p>
      </div>
    );
  }

  const COLORS = ['#0A2A43', '#1E5B8C', '#3B82F6', '#60A5FA', '#93C5FD'];

  const stats = [
    {
      title: 'Doanh thu tháng này',
      value: new Intl.NumberFormat('vi-VN').format(data.stats.revenueThisMonth) + ' ₫',
      change: '+12.5%', // Trend calculation could be added later
      trend: 'up',
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'Vé đã bán (tháng này)',
      value: data.stats.ticketsThisMonth.toLocaleString(),
      change: '+8.2%',
      trend: 'up',
      icon: Ticket,
      color: 'bg-blue-500',
    },
    {
      title: 'Tàu đang hoạt động',
      value: data.stats.activeTrains.toString(),
      change: '+0',
      trend: 'up',
      icon: Train,
      color: 'bg-purple-500',
    },
    {
      title: 'Hành khách',
      value: data.stats.totalPassengers.toLocaleString(),
      change: '+15.3%',
      trend: 'up',
      icon: Users,
      color: 'bg-orange-500',
    },
  ];

  const recentBookings = data.recentBookings;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Tổng quan hệ thống quản lý đường sắt</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isPositive = stat.trend === 'up';
          
          return (
            <Card key={stat.title} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {stat.change}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              <p className="text-sm text-muted-foreground mt-1">{stat.title}</p>
            </Card>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Doanh thu thống kê</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => new Intl.NumberFormat('vi-VN').format(value) + ' VNĐ'}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#0A2A43" 
                strokeWidth={2}
                name="Doanh thu"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Route Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Phân bổ theo tuyến đường</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.revenueByRoute}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.revenueByRoute.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticket Sales */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Số lượng vé bán ra</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="tickets" fill="#3B82F6" name="Số vé" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Seat Type Revenue */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Doanh thu theo loại ghế</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.revenueBySeatType} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="type" type="category" width={120} />
              <Tooltip 
                formatter={(value: number) => new Intl.NumberFormat('vi-VN').format(value) + ' VNĐ'}
              />
              <Bar dataKey="revenue" fill="#0A2A43" name="Doanh thu" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Đặt vé gần đây</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Mã vé</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Tuyến đường</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Hành khách</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Ngày đi</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Trạng thái</th>
                <th className="text-right py-3 px-4 font-semibold text-sm text-gray-700">Giá tiền</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.map((booking: any) => (
                <tr key={booking.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium">{booking.id}</td>
                  <td className="py-3 px-4 text-sm">{booking.route}</td>
                  <td className="py-3 px-4 text-sm">{booking.passenger}</td>
                  <td className="py-3 px-4 text-sm">{booking.date}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      booking.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800'
                        : booking.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {booking.status === 'confirmed' ? 'Đã xác nhận' : booking.status === 'pending' ? 'Chờ xử lý' : 'Đã hủy'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-right font-medium">
                    {new Intl.NumberFormat('vi-VN').format(booking.amount)} ₫
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
