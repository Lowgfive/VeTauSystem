import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { Line, Station } from '../../types';
import axios from 'axios';

export function StationManagement() {
    const [lines, setLines] = useState<Line[]>([]);
    const [stations, setStations] = useState<Station[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const API_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [linesRes, stationsRes] = await Promise.all([
                axios.get(`${API_URL}/lines`),
                axios.get(`${API_URL}/stations`)
            ]);

            setLines(linesRes.data.data);
            setStations(stationsRes.data.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Không thể tải dữ liệu tuyến và ga.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[#0A2A43]">Hệ thống Nhà ga (Stations)</h1>
                    <p className="text-muted-foreground mt-1">Quản lý danh sách các ga tàu trong hệ thống</p>
                </div>
                <Button onClick={() => toast.info('Tính năng Thêm ga đang được phát triển.')} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm ga mới
                </Button>
            </div>

            <Card className="overflow-hidden shadow-sm border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#0A2A43] text-white">
                            <tr>
                                <th className="py-3 px-4 font-semibold">Tên ga</th>
                                <th className="py-3 px-4 font-semibold">Mã ga</th>
                                <th className="py-3 px-4 font-semibold">Tuyến</th>
                                <th className="py-3 px-4 font-semibold">Vị trí</th>
                                <th className="py-3 px-4 font-semibold">Trạng thái</th>
                                <th className="py-3 px-4 font-semibold text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {stations.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                                        Chưa có dữ liệu nhà ga.
                                    </td>
                                </tr>
                            ) : (
                                stations.map((station) => {
                                    const line = lines.find(l => l._id === (station.line_id as any)?._id || l._id === station.line_id);
                                    return (
                                        <tr key={station._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-3 px-4 font-semibold text-[#0A2A43]">{station.station_name}</td>
                                            <td className="py-3 px-4 font-medium">{station.station_code}</td>
                                            <td className="py-3 px-4">
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                    {line?.line_code || 'N/A'}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 text-muted-foreground">
                                                <div className="flex items-center gap-1 truncate max-w-[200px]" title={station.location}>
                                                    <MapPin className="w-3 h-3 flex-shrink-0" />
                                                    <span className="truncate">{station.location}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                {station.is_active ?
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                        Đang hoạt động
                                                    </span> :
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                        Tạm dừng
                                                    </span>
                                                }
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="outline" size="sm" className="h-8 shadow-sm" onClick={() => toast.info('Edit not implemented')}>
                                                        <Edit className="w-3.5 h-3.5 mr-1" /> Sửa
                                                    </Button>
                                                    <Button variant="outline" size="sm" className="h-8 shadow-sm text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200" onClick={() => toast.info('Delete not implemented')}>
                                                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Xóa
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

