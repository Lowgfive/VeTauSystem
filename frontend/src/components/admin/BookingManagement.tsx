import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Search, Eye, Filter } from 'lucide-react';
import { toast } from 'sonner';

const dummyBookings = [
    { id: 'BK-1001', passenger: 'Nguyễn Văn A', phone: '0901234567', train: 'SE1', route: 'Hà Nội - Sài Gòn', date: '14/03/2026', seat: 'Toa 1 - Số 12A', amount: '1,200,000 ₫', status: 'PAID' },
    { id: 'BK-1002', passenger: 'Trần Thị B', phone: '0912345678', train: 'SE2', route: 'Đà Nẵng - Huế', date: '14/03/2026', seat: 'Toa 2 - Số 05B', amount: '450,000 ₫', status: 'PENDING' },
    { id: 'BK-1003', passenger: 'Lê Văn C', phone: '0987654321', train: 'SE3', route: 'Sài Gòn - Nha Trang', date: '13/03/2026', seat: 'Toa 4 - Số 22C', amount: '850,000 ₫', status: 'PAID' },
    { id: 'BK-1004', passenger: 'Phạm Thị D', phone: '0971122334', train: 'SE4', route: 'Hà Nội - Vinh', date: '13/03/2026', seat: 'Toa 1 - Số 02A', amount: '350,000 ₫', status: 'CANCELLED' },
    { id: 'BK-1005', passenger: 'Hoàng Văn E', phone: '0933445566', train: 'SE1', route: 'Hải Phòng - Hà Nội', date: '12/03/2026', seat: 'Toa 3 - Số 15D', amount: '150,000 ₫', status: 'PAID' },
    { id: 'BK-1006', passenger: 'Vũ Thị F', phone: '0944556677', train: 'SE2', route: 'Nha Trang - Sài Gòn', date: '12/03/2026', seat: 'Toa 5 - Số 08A', amount: '650,000 ₫', status: 'PAID' },
];

export function BookingManagement() {
    const [bookings] = useState(dummyBookings);

    const handleViewDetails = (id: string) => {
        toast.info(`Xem chi tiết mã vé: ${id} (Đang phát triển)`);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#0A2A43]">Quản lý Đặt chỗ</h1>
                    <p className="text-muted-foreground mt-1">Tra cứu danh sách vé và thông tin hành khách</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                        <Filter className="w-4 h-4 mr-2" />
                        Lọc theo trạng thái
                    </Button>
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Tìm mã vé, SĐT..." 
                            className="pl-9 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                        />
                    </div>
                </div>
            </div>

            <Card className="overflow-hidden shadow-sm border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#0A2A43] text-white">
                            <tr>
                                <th className="py-3 px-4 font-semibold">Mã vé</th>
                                <th className="py-3 px-4 font-semibold">Khách hàng</th>
                                <th className="py-3 px-4 font-semibold">Tàu / Tuyến</th>
                                <th className="py-3 px-4 font-semibold">Ngày đi</th>
                                <th className="py-3 px-4 font-semibold">Ghế ngồi</th>
                                <th className="py-3 px-4 font-semibold text-right">Tổng tiền</th>
                                <th className="py-3 px-4 font-semibold text-center">Trạng thái</th>
                                <th className="py-3 px-4 font-semibold text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {bookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="py-3 px-4 font-bold text-blue-600">{booking.id}</td>
                                    <td className="py-3 px-4">
                                        <div className="font-semibold text-gray-900">{booking.passenger}</div>
                                        <div className="text-xs text-muted-foreground">{booking.phone}</div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="font-medium">{booking.train}</div>
                                        <div className="text-xs text-muted-foreground truncate max-w-[150px]">{booking.route}</div>
                                    </td>
                                    <td className="py-3 px-4 font-medium">{booking.date}</td>
                                    <td className="py-3 px-4 text-gray-600">{booking.seat}</td>
                                    <td className="py-3 px-4 font-semibold text-right text-gray-900">{booking.amount}</td>
                                    <td className="py-3 px-4 text-center">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                                            ${booking.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                                booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'}
                                        `}>
                                            {booking.status === 'PAID' ? 'Thành công' : 
                                             booking.status === 'PENDING' ? 'Chờ thanh toán' : 'Đã hủy'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center justify-end">
                                            <Button variant="ghost" size="sm" className="h-8 shadow-sm hover:bg-blue-50 hover:text-blue-700" onClick={() => handleViewDetails(booking.id)}>
                                                <Eye className="w-4 h-4 mr-1" /> Xem
                                            </Button>
                                        </div>
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
