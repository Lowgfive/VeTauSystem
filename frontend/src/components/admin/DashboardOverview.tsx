import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { DollarSign, Users, Ticket, Activity } from 'lucide-react';

const revenueData = [
    { name: 'T2', total: 12000000 },
    { name: 'T3', total: 15000000 },
    { name: 'T4', total: 18000000 },
    { name: 'T5', total: 14000000 },
    { name: 'T6', total: 22000000 },
    { name: 'T7', total: 35000000 },
    { name: 'CN', total: 38000000 },
];

const recentBookings = [
    { id: 'BK-1001', passenger: 'Nguyễn Văn A', route: 'Hà Nội - Sài Gòn', date: '14/03/2026', status: 'PAID' },
    { id: 'BK-1002', passenger: 'Trần Thị B', route: 'Đà Nẵng - Huế', date: '14/03/2026', status: 'PENDING' },
    { id: 'BK-1003', passenger: 'Lê Văn C', route: 'Sài Gòn - Nha Trang', date: '13/03/2026', status: 'PAID' },
    { id: 'BK-1004', passenger: 'Phạm Thị D', route: 'Hà Nội - Vinh', date: '13/03/2026', status: 'CANCELLED' },
    { id: 'BK-1005', passenger: 'Hoàng Văn E', route: 'Hải Phòng - Hà Nội', date: '12/03/2026', status: 'PAID' },
];

export function DashboardOverview() {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-[#0A2A43]">Dashboard Overview</h2>

            {/* Top Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="shadow-sm border-gray-100">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Tổng doanh thu</CardTitle>
                        <DollarSign className="w-5 h-5 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[#0A2A43]">154,000,000 ₫</div>
                        <p className="text-xs text-green-600 mt-1">+12.5% so với tháng trước</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-gray-100">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Chuyến đi hôm nay</CardTitle>
                        <Activity className="w-5 h-5 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[#0A2A43]">42</div>
                        <p className="text-xs text-green-600 mt-1">100% đang hoạt động</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-gray-100">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Vé đã bán</CardTitle>
                        <Ticket className="w-5 h-5 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[#0A2A43]">1,284</div>
                        <p className="text-xs text-green-600 mt-1">+8.2% so với tuần trước</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-gray-100">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Người dùng Active</CardTitle>
                        <Users className="w-5 h-5 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-[#0A2A43]">5,423</div>
                        <p className="text-xs text-green-600 mt-1">+15 mới hôm nay</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts & Tables Container */}
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
                {/* Revenue Bar Chart */}
                <Card className="lg:col-span-4 shadow-sm border-gray-100">
                    <CardHeader>
                        <CardTitle className="text-lg text-[#0A2A43] font-semibold">Doanh thu 7 ngày qua</CardTitle>
                    </CardHeader>
                    <CardContent className="px-2 sm:p-6 sm:pt-0">
                        <div className="h-[300px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value / 1000000}M`}
                                    />
                                    <Tooltip
                                        formatter={(value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
                                        cursor={{ fill: 'rgba(10, 42, 67, 0.05)' }}
                                    />
                                    <Bar
                                        dataKey="total"
                                        fill="#2563EB"
                                        radius={[4, 4, 0, 0]}
                                        className="hover:opacity-80 transition-opacity"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Bookings Table */}
                <Card className="lg:col-span-3 shadow-sm border-gray-100">
                    <CardHeader>
                        <CardTitle className="text-lg text-[#0A2A43] font-semibold">Giao dịch gần đây</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-muted-foreground uppercase bg-gray-50/50">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Mã vé</th>
                                        <th className="px-4 py-3 font-medium">Hành khách</th>
                                        <th className="px-4 py-3 font-medium">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {recentBookings.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-blue-600">{booking.id}</td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-900">{booking.passenger}</div>
                                                <div className="text-xs text-muted-foreground">{booking.route}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                                                    ${booking.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                                        booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'}
                                                `}>
                                                    {booking.status === 'PAID' ? 'Đã Thanh Toán' : 
                                                     booking.status === 'PENDING' ? 'Chờ Xử Lý' : 'Đã Hủy'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
