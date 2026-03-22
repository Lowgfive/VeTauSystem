import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Search, Plus, Edit, Trash2, MapPin, X, Navigation } from 'lucide-react';
import { toast } from 'sonner';
import { fetchStations, createStation, updateStation, deleteStation, Station } from '../../services/station.service';

export function StationManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    station_name: '',
    station_code: '',
    location: '',
    station_order: 0,
    station_type: 'ground' as 'underground' | 'elevated' | 'ground',
    lat: undefined as number | undefined,
    lng: undefined as number | undefined,
  });

  const loadStations = async () => {
    try {
      setIsLoading(true);
      const data = await fetchStations();
      if (data.success) {
        setStations(data.data);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể tải danh sách ga tàu');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStations();
  }, []);

  const filteredStations = stations.filter(s => {
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = s.station_name?.toLowerCase().includes(searchLower) || false;
    const codeMatch = s.station_code?.toLowerCase().includes(searchLower) || false;
    return nameMatch || codeMatch;
  });

  const handleCreate = async () => {
    try {
      if (!formData.station_name || !formData.station_code || !formData.location) {
        toast.error('Vui lòng nhập đầy đủ thông tin bắt buộc');
        return;
      }
      const res = await createStation(formData);
      if (res.success) {
        toast.success('Thêm ga tàu thành công');
        setShowAddModal(false);
        setFormData({
          station_name: '',
          station_code: '',
          location: '',
          station_order: 0,
          station_type: 'ground',
          lat: undefined,
          lng: undefined,
        });
        loadStations();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi thêm ga');
    }
  };

  const handleUpdate = async () => {
    if (!selectedStation) return;
    try {
      const res = await updateStation(selectedStation._id, formData);
      if (res.success) {
        toast.success('Cập nhật ga tàu thành công');
        setShowEditModal(false);
        loadStations();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật ga');
    }
  };

  const handleDelete = async (station: Station) => {
    if (confirm(`Bạn có chắc muốn vô hiệu hóa ga ${station.station_name}?`)) {
      try {
        const res = await deleteStation(station._id);
        if (res.success) {
          toast.success(`Đã vô hiệu hóa ga ${station.station_name}`);
          loadStations();
        }
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Không thể xóa ga này');
      }
    }
  };

  const getStationTypeBadge = (type: string) => {
    switch (type) {
      case 'underground': return <Badge className="bg-purple-100 text-purple-800">Ga ngầm</Badge>;
      case 'elevated': return <Badge className="bg-blue-100 text-blue-800">Trên cao</Badge>;
      default: return <Badge className="bg-green-100 text-green-800">Mặt đất</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Ga tàu</h1>
          <p className="text-muted-foreground mt-1">Danh sách và thông tin các nhà ga trong hệ thống</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm ga mới
        </Button>
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên ga, mã ga..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>
        <Card className="p-4 flex flex-col justify-center items-center">
            <p className="text-2xl font-bold text-primary">{stations.length}</p>
            <p className="text-sm text-muted-foreground">Tổng số ga</p>
        </Card>
      </div>

      {/* Station List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-3 text-center py-12">Đang tải...</div>
        ) : filteredStations.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-muted-foreground">Không tìm thấy ga nào</div>
        ) : (
          filteredStations.map((station) => (
            <Card key={station._id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{station.station_name}</h3>
                    <p className="text-sm font-mono text-muted-foreground tracking-wider">{station.station_code}</p>
                  </div>
                </div>
                {getStationTypeBadge(station.station_type)}
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-6">
                <div className="flex items-start gap-2">
                  <Navigation className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                  <span>{station.location}</span>
                </div>
                {station.lat && station.lng && (
                   <div className="text-xs text-muted-foreground ml-6">
                     Tọa độ: {station.lat}, {station.lng}
                   </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-muted-foreground">Thứ tự trên tuyến:</span>
                  <span className="font-bold text-primary">{station.station_order}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                        setSelectedStation(station);
                        setFormData({
                            station_name: station.station_name,
                            station_code: station.station_code,
                            location: station.location,
                            station_order: station.station_order,
                            station_type: station.station_type,
                            lat: station.lat,
                            lng: station.lng,
                        });
                        setShowEditModal(true);
                    }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Sửa
                </Button>
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-destructive hover:bg-destructive hover:text-white"
                    onClick={() => handleDelete(station)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xóa
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modals */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{showAddModal ? 'Thêm ga mới' : 'Sửa thông tin ga'}</h2>
              <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tên ga *</Label>
                  <Input 
                    value={formData.station_name}
                    onChange={(e) => setFormData({...formData, station_name: e.target.value})}
                    placeholder="Ga Hà Nội" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mã ga *</Label>
                  <Input 
                    value={formData.station_code}
                    onChange={(e) => setFormData({...formData, station_code: e.target.value})}
                    placeholder="HAN" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Vị trí / Địa chỉ *</Label>
                <Input 
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="120 Lê Duẩn, Hoàn Kiếm, Hà Nội" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Thứ tự ga</Label>
                  <Input 
                    type="number"
                    value={formData.station_order}
                    onChange={(e) => setFormData({...formData, station_order: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Loại ga</Label>
                  <select 
                    className="w-full px-3 py-2 border rounded-lg text-sm h-10"
                    value={formData.station_type}
                    onChange={(e) => setFormData({...formData, station_type: e.target.value as any})}
                  >
                    <option value="ground">Mặt đất</option>
                    <option value="elevated">Trên cao</option>
                    <option value="underground">Ga ngầm</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Vĩ độ (Latitude)</Label>
                  <Input 
                    type="number"
                    step="0.000001"
                    value={formData.lat || ''}
                    onChange={(e) => setFormData({...formData, lat: parseFloat(e.target.value) || undefined})}
                    placeholder="21.0245"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Kinh độ (Longitude)</Label>
                  <Input 
                    type="number"
                    step="0.000001"
                    value={formData.lng || ''}
                    onChange={(e) => setFormData({...formData, lng: parseFloat(e.target.value) || undefined})}
                    placeholder="105.8412"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button className="flex-1" onClick={showAddModal ? handleCreate : handleUpdate}>
                  {showAddModal ? 'Thêm mới' : 'Cập nhật'}
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => { setShowAddModal(false); setShowEditModal(false); }}>
                  Hủy
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
