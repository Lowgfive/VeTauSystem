import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Calendar, Edit, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const dummySchedules = [
    { id: 'SCH-01', train: 'SE1', route: 'Hà Nội - Sài Gòn', date: '14/03/2026', departure: '08:00', arrival: '16:00 (Hôm sau)', status: 'ON_TIME' },
    { id: 'SCH-02', train: 'SE2', route: 'Sài Gòn - Hà Nội', date: '14/03/2026', departure: '09:00', arrival: '17:00 (Hôm sau)', status: 'DELAYED' },
    { id: 'SCH-03', train: 'SE3', route: 'Hà Nội - Đà Nẵng', date: '15/03/2026', departure: '10:00', arrival: '22:00', status: 'ON_TIME' },
    { id: 'SCH-04', train: 'SE4', route: 'Đà Nẵng - Hà Nội', date: '15/03/2026', departure: '14:00', arrival: '02:00 (Hôm sau)', status: 'CANCELLED' },
];

export function ScheduleManagement() {
    const [schedules] = useState(dummySchedules);

    const handleEdit = () => {
        toast.info('Tính năng chỉnh sửa lịch trình đang phát triển.');
    };

    const handleCancel = () => {
        toast.error('Tính năng hủy chuyến đang phát triển.');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#0A2A43]">Quản lý Lịch trình</h1>
                    <p className="text-muted-foreground mt-1">Theo dõi và cập nhật lịch trình của các chuyến tàu</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Calendar className="w-4 h-4 mr-2" />
                    Thêm lịch trình mới
                </Button>
            </div>

            <Card className="overflow-hidden shadow-sm border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#0A2A43] text-white">
                            <tr>
                                <th className="py-3 px-4 font-semibold">Mã chuyến</th>
                                <th className="py-3 px-4 font-semibold">Tàu</th>
                                <th className="py-3 px-4 font-semibold">Tuyến</th>
                                <th className="py-3 px-4 font-semibold">Ngày chạy</th>
                                <th className="py-3 px-4 font-semibold">Khởi hành</th>
                                <th className="py-3 px-4 font-semibold">Đến</th>
                                <th className="py-3 px-4 font-semibold">Trạng thái</th>
                                <th className="py-3 px-4 font-semibold text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {schedules.map((sch) => (
                                <tr key={sch.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="py-3 px-4 font-medium text-blue-600">{sch.id}</td>
                                    <td className="py-3 px-4 font-semibold text-gray-900">{sch.train}</td>
                                    <td className="py-3 px-4 text-muted-foreground">{sch.route}</td>
                                    <td className="py-3 px-4 font-medium">{sch.date}</td>
                                    <td className="py-3 px-4">{sch.departure}</td>
                                    <td className="py-3 px-4">{sch.arrival}</td>
                                    <td className="py-3 px-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                                            ${sch.status === 'ON_TIME' ? 'bg-green-100 text-green-700' :
                                                sch.status === 'DELAYED' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'}
                                        `}>
                                            {sch.status === 'ON_TIME' ? 'Đúng giờ' : 
                                             sch.status === 'DELAYED' ? 'Đang trễ' : 'Đã hủy'}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="outline" size="sm" className="h-8 shadow-sm" onClick={handleEdit}>
                                                <Edit className="w-3.5 h-3.5 mr-1" /> Sửa
                                            </Button>
                                            <Button variant="outline" size="sm" className="h-8 shadow-sm text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200" onClick={handleCancel}>
                                                <XCircle className="w-3.5 h-3.5 mr-1" /> Hủy
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
