import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { MapPin, Plus, Edit, Trash2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { MetroLine, Station } from '../../types';
import axios from 'axios';

export function MetrolineManagement() {
    const [metrolines, setMetrolines] = useState<MetroLine[]>([]);
    const [stations, setStations] = useState<Station[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Hardcode base API for now
    const API_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [linesRes, stationsRes] = await Promise.all([
                axios.get(`${API_URL}/metrolines`),
                axios.get(`${API_URL}/stations`)
            ]);

            setMetrolines(linesRes.data.data);
            setStations(stationsRes.data.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Không thể tải dữ liệu tuyến và ga. Vui lòng bật DB.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSeedLine5 = async () => {
        try {
            if (!confirm('Hành động này sẽ tạo Tuyến 5 và 20 nhà ga mặc định. Bạn có chắc chắn?')) return;

            const res = await axios.post(`${API_URL}/metrolines/seed-line5`);
            toast.success(res.data.message || 'Đã tạo thành công dữ liệu Tuyến 5');
            fetchData(); // Refresh data
        } catch (error) {
            console.error('Seed error:', error);
            toast.error('Lỗi khi khởi tạo Tuyến 5. Vui lòng kiểm tra console.');
        }
    };

    const getStationTypeBadge = (type: string) => {
        const config: any = {
            'underground': { label: 'Đi ngầm', color: 'bg-purple-100 text-purple-800' },
            'elevated': { label: 'Trên cao', color: 'bg-blue-100 text-blue-800' },
            'ground': { label: 'Mặt đất', color: 'bg-green-100 text-green-800' }
        };
        const style = config[type] || { label: type, color: 'bg-gray-100 text-gray-800' };
        return <Badge className={style.color}>{style.label}</Badge>;
    };

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Quản lý Tuyến & Ga Metro</h1>
                    <p className="text-muted-foreground mt-1">Danh sách các tuyến và hệ thống nhà ga trực thuộc</p>
                </div>
                <Button onClick={handleSeedLine5} variant="default" className="bg-green-600 hover:bg-green-700">
                    <ShieldAlert className="w-4 h-4 mr-2" />
                    Khởi tạo Tuyến Số 5
                </Button>
            </div>

            {/* Lines Section */}
            <h2 className="text-xl font-semibold mt-8 mb-4">Các Tuyến Metro (Lines)</h2>
            {metrolines.length === 0 ? (
                <Card className="p-8 text-center border-dashed">
                    <p className="text-muted-foreground mb-4">Chưa có tuyến Metro nào trong hệ thống.</p>
                    <Button onClick={handleSeedLine5} variant="outline">
                        Tạo Tuyến 5 tự động
                    </Button>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {metrolines.map((line) => (
                        <Card key={line._id} className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <Badge className="bg-primary text-white text-lg px-2">{line.line_code}</Badge>
                                        <h3 className="text-xl font-bold">{line.line_name}</h3>
                                        {line.is_active ? (
                                            <Badge className="bg-green-100 text-green-800 border-green-200">Hoạt động</Badge>
                                        ) : (
                                            <Badge className="bg-gray-100 text-gray-800">Chưa khai thác</Badge>
                                        )}
                                    </div>
                                    <div className="flex gap-6 mt-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            <span>{line.total_distance} km</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center text-[10px] font-bold">ST</div>
                                            <span>{line.total_stations} nhà ga</span>
                                        </div>
                                        <div>
                                            <span>Giờ hoạt động: {line.operating_hours.start} - {line.operating_hours.end}</span>
                                            <span className="mx-2">|</span>
                                            <span>Tần suất: {line.frequency_minutes} phút/chuyến</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm">
                                        <Edit className="w-4 h-4 mr-2" /> Sửa
                                    </Button>
                                    <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive hover:text-white">
                                        <Trash2 className="w-4 h-4 mr-2" /> Xóa
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Stations Section */}
            <div className="flex items-center justify-between mt-8 mb-4">
                <h2 className="text-xl font-semibold">Hệ thống Nhà ga (Stations)</h2>
                <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" /> Thêm ga mới
                </Button>
            </div>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">STT</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Mã ga</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Tên ga</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Tuyến</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Loại xây dựng</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Vị trí</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stations.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-muted-foreground">
                                        Chưa có dữ liệu nhà ga.
                                    </td>
                                </tr>
                            ) : (
                                stations.map((station) => {
                                    const line = metrolines.find(l => l._id === station.line_id);
                                    return (
                                        <tr key={station._id} className="border-b hover:bg-gray-50">
                                            <td className="py-3 px-4">{station.station_order}</td>
                                            <td className="py-3 px-4 font-medium">{station.station_code}</td>
                                            <td className="py-3 px-4 font-semibold">{station.station_name}</td>
                                            <td className="py-3 px-4">
                                                <Badge variant="outline">{line?.line_code || 'L5'}</Badge>
                                            </td>
                                            <td className="py-3 px-4">{getStationTypeBadge(station.station_type)}</td>
                                            <td className="py-3 px-4 text-muted-foreground truncate max-w-xs" title={station.location}>
                                                {station.location}
                                            </td>
                                            <td className="py-3 px-4">
                                                {station.is_active ?
                                                    <span className="text-green-600 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Đang GD</span> :
                                                    <span className="text-gray-500">Chưa GD</span>
                                                }
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
