import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Download, TrendingUp, Users, DollarSign, Ticket, Calendar } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function Reports() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  // Mock data for comprehensive reports
  const dailyRevenueData = [
    { date: '01/02', revenue: 125000000, tickets: 650, passengers: 1205 },
    { date: '02/02', revenue: 138000000, tickets: 720, passengers: 1340 },
    { date: '03/02', revenue: 142000000, tickets: 740, passengers: 1380 },
    { date: '04/02', revenue: 156000000, tickets: 810, passengers: 1510 },
    { date: '05/02', revenue: 148000000, tickets: 770, passengers: 1440 },
    { date: '06/02', revenue: 167000000, tickets: 870, passengers: 1620 },
    { date: '07/02', revenue: 182000000, tickets: 950, passengers: 1770 },
  ];

  const routePerformance = [
    { route: 'HN - SG', tickets: 12400, revenue: 15500000000, avgOccupancy: 87 },
    { route: 'HN - DN', tickets: 8200, revenue: 9800000000, avgOccupancy: 82 },
    { route: 'SG - NT', tickets: 6800, revenue: 7200000000, avgOccupancy: 78 },
    { route: 'HN - Huế', tickets: 5100, revenue: 5800000000, avgOccupancy: 75 },
    { route: 'DN - NT', tickets: 3900, revenue: 4100000000, avgOccupancy: 71 },
  ];

  const monthlyComparison = [
    { month: 'T8/2025', revenue: 2800000000, growth: 5.2 },
    { month: 'T9/2025', revenue: 2900000000, growth: 3.6 },
    { month: 'T10/2025', revenue: 3100000000, growth: 6.9 },
    { month: 'T11/2025', revenue: 3200000000, growth: 3.2 },
    { month: 'T12/2025', revenue: 3400000000, growth: 6.3 },
    { month: 'T1/2026', revenue: 3500000000, growth: 2.9 },
  ];

  const seatClassRevenue = [
    { class: 'Giường nằm mềm điều hòa', revenue: 5800000000, percentage: 38 },
    { class: 'Giường nằm cứng', revenue: 4200000000, percentage: 27 },
    { class: 'Ngồi mềm điều hòa', revenue: 3400000000, percentage: 22 },
    { class: 'Ngồi cứng', revenue: 2100000000, percentage: 13 },
  ];

  const peakHours = [
    { hour: '00:00', bookings: 12 },
    { hour: '03:00', bookings: 8 },
    { hour: '06:00', bookings: 45 },
    { hour: '09:00', bookings: 168 },
    { hour: '12:00', bookings: 142 },
    { hour: '15:00', bookings: 198 },
    { hour: '18:00', bookings: 224 },
    { hour: '21:00', bookings: 185 },
  ];

  const topMetrics = [
    {
      title: 'Tổng doanh thu tháng này',
      value: '3.5 tỷ VNĐ',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'Vé đã bán',
      value: '18,245',
      change: '+8.2%',
      trend: 'up',
      icon: Ticket,
      color: 'bg-blue-500',
    },
    {
      title: 'Tổng hành khách',
      value: '42,186',
      change: '+15.3%',
      trend: 'up',
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      title: 'Tỷ lệ lấp đầy TB',
      value: '82%',
      change: '+3.1%',
      trend: 'up',
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ];

  const exportReport = (type: string) => {
    // Mock export functionality
    const filename = `bao-cao-${type}-${new Date().toISOString().split('T')[0]}.xlsx`;
    console.log(`Exporting: ${filename}`);
    alert(`Đang xuất báo cáo: ${filename}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Báo cáo</h1>
          <p className="text-muted-foreground mt-1">Phân tích dữ liệu và thống kê toàn diện</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-4 py-2 border rounded-lg bg-white"
          >
            <option value="week">7 ngày qua</option>
            <option value="month">30 ngày qua</option>
            <option value="quarter">3 tháng qua</option>
            <option value="year">12 tháng qua</option>
          </select>
          
          <Button onClick={() => exportReport('tong-hop')}>
            <Download className="w-4 h-4 mr-2" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {topMetrics.map((metric) => {
          const Icon = metric.icon;
          
          return (
            <Card key={metric.title} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${metric.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendingUp className="w-4 h-4" />
                  {metric.change}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{metric.value}</h3>
              <p className="text-sm text-muted-foreground mt-1">{metric.title}</p>
            </Card>
          );
        })}
      </div>

      {/* Revenue Trend */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Xu hướng doanh thu theo ngày</h3>
          <Button variant="outline" size="sm" onClick={() => exportReport('doanh-thu')}>
            <Download className="w-4 h-4 mr-2" />
            Xuất
          </Button>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={dailyRevenueData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0A2A43" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#0A2A43" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => new Intl.NumberFormat('vi-VN').format(value) + ' VNĐ'}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#0A2A43" 
              fillOpacity={1}
              fill="url(#colorRevenue)"
              name="Doanh thu"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Route Performance & Monthly Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Route Performance */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Hiệu suất theo tuyến</h3>
            <Button variant="outline" size="sm" onClick={() => exportReport('tuyen-duong')}>
              <Download className="w-4 h-4 mr-2" />
              Xuất
            </Button>
          </div>
          <div className="space-y-4">
            {routePerformance.map((route, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{route.route}</span>
                  <span className="text-muted-foreground">{route.avgOccupancy}% lấp đầy</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full transition-all"
                    style={{ width: `${route.avgOccupancy}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{route.tickets.toLocaleString('vi-VN')} vé</span>
                  <span>{(route.revenue / 1000000000).toFixed(1)} tỷ VNĐ</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Monthly Comparison */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">So sánh theo tháng</h3>
            <Button variant="outline" size="sm" onClick={() => exportReport('theo-thang')}>
              <Download className="w-4 h-4 mr-2" />
              Xuất
            </Button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => new Intl.NumberFormat('vi-VN').format(value) + ' VNĐ'}
              />
              <Legend />
              <Bar dataKey="revenue" fill="#0A2A43" name="Doanh thu" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Seat Class & Peak Hours */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Seat Class Revenue */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Doanh thu theo loại ghế</h3>
            <Button variant="outline" size="sm" onClick={() => exportReport('loai-ghe')}>
              <Download className="w-4 h-4 mr-2" />
              Xuất
            </Button>
          </div>
          <div className="space-y-4">
            {seatClassRevenue.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{item.class}</span>
                  <span className="text-sm font-bold text-primary">
                    {(item.revenue / 1000000000).toFixed(1)} tỷ
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-gradient-to-r from-blue-600 to-blue-400 h-2.5 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground w-10 text-right">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Peak Booking Hours */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Giờ cao điểm đặt vé</h3>
            <Button variant="outline" size="sm" onClick={() => exportReport('gio-cao-diem')}>
              <Download className="w-4 h-4 mr-2" />
              Xuất
            </Button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={peakHours}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="bookings" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Số lượng đặt vé"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Summary Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Bảng tổng hợp chi tiết</h3>
          <Button variant="outline" size="sm" onClick={() => exportReport('chi-tiet')}>
            <Download className="w-4 h-4 mr-2" />
            Xuất Excel
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Chỉ số</th>
                <th className="text-right py-3 px-4 font-semibold text-sm text-gray-700">Hôm nay</th>
                <th className="text-right py-3 px-4 font-semibold text-sm text-gray-700">Tuần này</th>
                <th className="text-right py-3 px-4 font-semibold text-sm text-gray-700">Tháng này</th>
                <th className="text-right py-3 px-4 font-semibold text-sm text-gray-700">Năm nay</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">Doanh thu</td>
                <td className="py-3 px-4 text-right">182 tr</td>
                <td className="py-3 px-4 text-right">1.05 tỷ</td>
                <td className="py-3 px-4 text-right">3.5 tỷ</td>
                <td className="py-3 px-4 text-right">38.2 tỷ</td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">Số vé bán</td>
                <td className="py-3 px-4 text-right">950</td>
                <td className="py-3 px-4 text-right">5,480</td>
                <td className="py-3 px-4 text-right">18,245</td>
                <td className="py-3 px-4 text-right">198,650</td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">Hành khách</td>
                <td className="py-3 px-4 text-right">1,770</td>
                <td className="py-3 px-4 text-right">10,240</td>
                <td className="py-3 px-4 text-right">42,186</td>
                <td className="py-3 px-4 text-right">456,890</td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">Tỷ lệ lấp đầy</td>
                <td className="py-3 px-4 text-right">85%</td>
                <td className="py-3 px-4 text-right">83%</td>
                <td className="py-3 px-4 text-right">82%</td>
                <td className="py-3 px-4 text-right">79%</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">Vé hủy</td>
                <td className="py-3 px-4 text-right">28</td>
                <td className="py-3 px-4 text-right">164</td>
                <td className="py-3 px-4 text-right">547</td>
                <td className="py-3 px-4 text-right">5,932</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button variant="outline" className="h-auto py-4" onClick={() => exportReport('bao-cao-ngay')}>
          <div className="flex flex-col items-center gap-2">
            <Calendar className="w-6 h-6" />
            <span className="font-semibold">Báo cáo ngày</span>
            <span className="text-xs text-muted-foreground">Xuất báo cáo chi tiết theo ngày</span>
          </div>
        </Button>
        
        <Button variant="outline" className="h-auto py-4" onClick={() => exportReport('bao-cao-tuyen')}>
          <div className="flex flex-col items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            <span className="font-semibold">Phân tích tuyến</span>
            <span className="text-xs text-muted-foreground">Báo cáo hiệu suất theo tuyến</span>
          </div>
        </Button>
        
        <Button variant="outline" className="h-auto py-4" onClick={() => exportReport('bao-cao-tai-chinh')}>
          <div className="flex flex-col items-center gap-2">
            <DollarSign className="w-6 h-6" />
            <span className="font-semibold">Báo cáo tài chính</span>
            <span className="text-xs text-muted-foreground">Tổng hợp doanh thu & chi phí</span>
          </div>
        </Button>
      </div>
    </div>
  );
}
