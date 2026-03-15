import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { MapPin, Plus, Edit, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Line, Station } from '../../types';
import { apiClient } from '../../config/api';

export function LineManagement() {
    const [lines, setLines] = useState<Line[]>([]);
    const [stations, setStations] = useState<Station[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showLineModal, setShowLineModal] = useState(false);
    const [showStationModal, setShowStationModal] = useState(false);
    const [editingLine, setEditingLine] = useState<Line | null>(null);
    const [editingStation, setEditingStation] = useState<Station | null>(null);

    const [lineFormData, setLineFormData] = useState({
        line_name: '',
        line_code: '',
        total_distance: 0,
        total_stations: 0,
        is_active: true
    });

    const [stationFormData, setStationFormData] = useState({
        station_name: '',
        station_code: '',
        station_order: 0,
        line_id: '',
        location: '',
        station_type: 'underground' as 'underground' | 'elevated' | 'ground',
        is_active: true
    });

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [linesRes, stationsRes] = await Promise.all([
                apiClient.get('/lines'),
                apiClient.get('/stations')
            ]);

            setLines(linesRes.data.data);
            setStations(stationsRes.data.data);
        } catch (error: any) {
            console.error('Error fetching data:', error);
            toast.error(error?.response?.data?.message || 'Không thể tải dữ liệu tuyến và ga.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddLine = () => {
        setEditingLine(null);
        setLineFormData({
            line_name: '',
            line_code: '',
            total_distance: 0,
            total_stations: 0,
            is_active: true
        });
        setShowLineModal(true);
    };

    const handleEditLine = (line: Line) => {
        setEditingLine(line);
        setLineFormData({
            line_name: line.line_name || '',
            line_code: line.line_code || '',
            total_distance: line.total_distance || 0,
            total_stations: line.total_stations || 0,
            is_active: line.is_active !== undefined ? line.is_active : true
        });
        setShowLineModal(true);
    };

    const handleSaveLine = async () => {
        try {
            if (!lineFormData.line_name || !lineFormData.line_code) {
                toast.error('Vui lòng nhập đầy đủ thông tin');
                return;
            }

            if (editingLine) {
                await apiClient.put(`/lines/${editingLine._id}`, lineFormData);
                toast.success('Cập nhật tuyến thành công');
            } else {
                await apiClient.post('/lines', lineFormData);
                toast.success('Thêm tuyến thành công');
            }
            setShowLineModal(false);
            fetchData();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleDeleteLine = async (line: Line) => {
        if (!confirm(`Bạn có chắc muốn xóa tuyến ${line.line_name}?`)) {
            return;
        }
        try {
            await apiClient.delete(`/lines/${line._id}`);
            toast.success('Đã xóa tuyến thành công');
            fetchData();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi xóa tuyến');
        }
    };

    const handleAddStation = () => {
        setEditingStation(null);
        setStationFormData({
            station_name: '',
            station_code: '',
            station_order: 0,
            line_id: lines.length > 0 ? lines[0]._id : '',
            location: '',
            station_type: 'underground',
            is_active: true
        });
        setShowStationModal(true);
    };

    const handleEditStation = (station: Station) => {
        setEditingStation(station);
        setStationFormData({
            station_name: station.station_name || '',
            station_code: station.station_code || '',
            station_order: station.station_order || 0,
            line_id: typeof station.line_id === 'object' ? station.line_id._id : station.line_id || '',
            location: station.location || '',
            station_type: station.station_type || 'underground',
            is_active: station.is_active !== undefined ? station.is_active : true
        });
        setShowStationModal(true);
    };

    const handleSaveStation = async () => {
        try {
            if (!stationFormData.station_name || !stationFormData.station_code || !stationFormData.line_id) {
                toast.error('Vui lòng nhập đầy đủ thông tin');
                return;
            }

            if (editingStation) {
                await apiClient.put(`/stations/${editingStation._id}`, stationFormData);
                toast.success('Cập nhật ga thành công');
            } else {
                await apiClient.post('/stations', stationFormData);
                toast.success('Thêm ga thành công');
            }
            setShowStationModal(false);
            fetchData();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    const handleDeleteStation = async (station: Station) => {
        if (!confirm(`Bạn có chắc muốn xóa ga ${station.station_name}?`)) {
            return;
        }
        try {
            await apiClient.delete(`/stations/${station._id}`);
            toast.success('Đã xóa ga thành công');
            fetchData();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi xóa ga');
        }
    };


    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Quản lý Tuyến & Hệ thống Ga</h1>
                    <p className="text-muted-foreground mt-1">Danh sách các tuyến tàu và hệ thống nhà ga trực thuộc</p>
                </div>
                <Button onClick={handleAddLine} variant="default" className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm tuyến mới
                </Button>
            </div>

            {/* Lines Section */}
            <h2 className="text-xl font-semibold mt-8 mb-4">Các Tuyến Tàu (Lines)</h2>
            {lines.length === 0 ? (
                <Card className="p-8 text-center border-dashed">
                    <p className="text-muted-foreground mb-4">Chưa có tuyến đường sắt nào trong hệ thống.</p>
                    <Button onClick={() => toast.info('Vui lòng thêm tuyến mới manually.')} variant="outline">
                        Thêm tuyến ngay
                    </Button>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {lines.map((line) => (
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
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => handleEditLine(line)}>
                                        <Edit className="w-4 h-4 mr-2" /> Sửa
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-destructive hover:bg-destructive hover:text-white"
                                        onClick={() => handleDeleteLine(line)}
                                    >
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
                <Button variant="outline" size="sm" onClick={handleAddStation}>
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
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Vị trí</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Trạng thái</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Thao tác</th>
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
                                    const line = lines.find(l => l._id === (station.line_id as any)?._id || l._id === station.line_id);
                                    return (
                                        <tr key={station._id} className="border-b hover:bg-gray-50">
                                            <td className="py-3 px-4">{station.station_order}</td>
                                            <td className="py-3 px-4 font-medium">{station.station_code}</td>
                                            <td className="py-3 px-4 font-semibold">{station.station_name}</td>
                                            <td className="py-3 px-4">
                                                <Badge variant="outline">{line?.line_code || 'N/A'}</Badge>
                                            </td>
                                            <td className="py-3 px-4 text-muted-foreground truncate max-w-xs" title={station.location}>
                                                {station.location}
                                            </td>
                                            <td className="py-3 px-4">
                                                {station.is_active ?
                                                    <span className="text-green-600 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Đang GD</span> :
                                                    <span className="text-gray-500">Chưa GD</span>
                                                }
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => handleEditStation(station)}>
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-destructive hover:bg-destructive hover:text-white"
                                                        onClick={() => handleDeleteStation(station)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
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

            {/* Line Modal */}
            {showLineModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold">
                                    {editingLine ? 'Sửa tuyến' : 'Thêm tuyến mới'}
                                </h2>
                                <button onClick={() => setShowLineModal(false)}>
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Tên tuyến *</Label>
                                        <Input
                                            placeholder="Tuyến 5"
                                            value={lineFormData.line_name}
                                            onChange={(e) => setLineFormData({ ...lineFormData, line_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Mã tuyến *</Label>
                                        <Input
                                            placeholder="L5"
                                            value={lineFormData.line_code}
                                            onChange={(e) => setLineFormData({ ...lineFormData, line_code: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Tổng khoảng cách (km) *</Label>
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            value={lineFormData.total_distance}
                                            onChange={(e) => setLineFormData({ ...lineFormData, total_distance: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Tổng số ga *</Label>
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            value={lineFormData.total_stations}
                                            onChange={(e) => setLineFormData({ ...lineFormData, total_stations: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button className="flex-1" onClick={handleSaveLine}>
                                        {editingLine ? 'Cập nhật' : 'Thêm tuyến'}
                                    </Button>
                                    <Button variant="outline" className="flex-1" onClick={() => setShowLineModal(false)}>
                                        Hủy
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Station Modal */}
            {showStationModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold">
                                    {editingStation ? 'Sửa ga' : 'Thêm ga mới'}
                                </h2>
                                <button onClick={() => setShowStationModal(false)}>
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Tên ga *</Label>
                                        <Input
                                            placeholder="Ga Quần Ngựa"
                                            value={stationFormData.station_name}
                                            onChange={(e) => setStationFormData({ ...stationFormData, station_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Mã ga *</Label>
                                        <Input
                                            placeholder="L5-01"
                                            value={stationFormData.station_code}
                                            onChange={(e) => setStationFormData({ ...stationFormData, station_code: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Thứ tự *</Label>
                                        <Input
                                            type="number"
                                            placeholder="1"
                                            value={stationFormData.station_order}
                                            onChange={(e) => setStationFormData({ ...stationFormData, station_order: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Tuyến *</Label>
                                        <select
                                            className="w-full px-3 py-2 border rounded-lg"
                                            value={stationFormData.line_id}
                                            onChange={(e) => setStationFormData({ ...stationFormData, line_id: e.target.value })}
                                        >
                                            <option value="">Chọn tuyến</option>
                                            {lines.map((line) => (
                                                <option key={line._id} value={line._id}>
                                                    {line.line_name} ({line.line_code})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Vị trí</Label>
                                    <Input
                                        placeholder="Địa chỉ ga"
                                        value={stationFormData.location}
                                        onChange={(e) => setStationFormData({ ...stationFormData, location: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Loại ga</Label>
                                    <select
                                        className="w-full px-3 py-2 border rounded-lg"
                                        value={stationFormData.station_type}
                                        onChange={(e) => setStationFormData({ ...stationFormData, station_type: e.target.value as any })}
                                    >
                                        <option value="underground">Ngầm</option>
                                        <option value="elevated">Trên cao</option>
                                        <option value="ground">Mặt đất</option>
                                    </select>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button className="flex-1" onClick={handleSaveStation}>
                                        {editingStation ? 'Cập nhật' : 'Thêm ga'}
                                    </Button>
                                    <Button variant="outline" className="flex-1" onClick={() => setShowStationModal(false)}>
                                        Hủy
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}

