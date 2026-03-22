import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Search, Plus, Edit, Trash2, Train as TrainIcon, X, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Train } from '../../types';
import { SeatMap } from '../SeatMap';
import { apiClient } from '../../config/api';


export function TrainManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState<Train | null>(null);

  const [showSeatMapModal, setShowSeatMapModal] = useState(false);
  const [selectedTrainForMap, setSelectedTrainForMap] = useState<Train | null>(null);
  const [schedulesForMap, setSchedulesForMap] = useState<any[]>([]);
  const [selectedScheduleIdForMap, setSelectedScheduleIdForMap] = useState<string>('');

  const [trains, setTrains] = useState<Train[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    train_code: '',
    train_name: '',
    template_id: ''
  });

  const [trainTemplates, setTrainTemplates] = useState<any[]>([]);

  // API Base URL
  const API_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [trainsRes, templatesRes] = await Promise.all([
        apiClient.get(`/trains`),
        apiClient.get(`/templates/trains`)
      ]);
      setTrains(trainsRes.data.data);
      setTrainTemplates(templatesRes.data.data);

      if (templatesRes.data.data.length > 0) {
        setFormData(prev => ({
          ...prev,
          template_id: templatesRes.data.data[0]?._id || ''
        }));
      }
    } catch (error: any) {
      console.error('Lỗi khi fetch data:', error);

      // Kiểm tra nếu là lỗi kết nối (backend không chạy)
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error') || error.code === 'ECONNREFUSED') {
        toast.error('Không thể kết nối đến server. Vui lòng kiểm tra backend server đã chạy chưa.', {
          description: 'Backend server cần chạy tại http://localhost:4000',
          duration: 10000
        });
      } else {
        toast.error(error?.response?.data?.message || 'Không thể tải dữ liệu đoàn tàu.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredTrains = trains.filter(train =>
    train.train_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    train.train_name.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const getStatusBadge = (status: boolean | string) => {
    if (typeof status === 'boolean') {
      return status ? (
        <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>
      ) : (
        <Badge className="bg-gray-100 text-gray-800">Ngừng hoạt động</Badge>
      );
    }
    return status === 'active' ? (
      <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800">Ngừng hoạt động</Badge>
    );
  };

  const handleAddTrain = async () => {
    try {
      if (!formData.train_code || !formData.train_name || !formData.template_id) {
        toast.error('Vui lòng nhập đầy đủ thông tin (bao gồm mã mẫu tàu)');
        return;
      }
      await apiClient.post(`/trains`, formData);
      toast.success('Thêm tàu thành công');
      setShowAddModal(false);
      fetchData();
    } catch (error) {
      toast.error('Có lỗi xảy ra khi thêm tàu');
    }
  };

  const handleViewMap = async (train: Train) => {
    setSelectedTrainForMap(train);
    try {
      // Lấy danh sách lịch theo tàu (giới hạn 60 chuyến gần nhất để tránh load chậm)
      const resSchedules = await apiClient.get(`/schedules`, {
        params: { trainId: train._id, limit: 60 },
      });
      const list = resSchedules.data?.data || [];
      setSchedulesForMap(list);

      if (!list.length) {
        toast.warning('Tàu này chưa có lịch chạy. Vui lòng sinh lịch ở tab Lịch trình trước.');
        return;
      }

      setSelectedScheduleIdForMap(list[0]._id);
      setShowSeatMapModal(true);
    } catch (e: any) {
      console.error('Error loading schedules:', e);
      toast.error(e?.response?.data?.message || 'Không thể tải lịch chạy. Vui lòng thử lại.');
    }
  };

  const handleGenerateCarriages = async (train: Train) => {
    const loadingToast = toast.loading('Đang tạo toa và ghế...');
    try {
      const res = await apiClient.post(`/trains/${train._id}/generate-carriages`);
      toast.dismiss(loadingToast);
      toast.success(res.data.message || 'Đã tạo toa và ghế thành công');
      // Sau khi tạo xong, tự động mở sơ đồ
      await handleViewMap(train);
      fetchData(); // Refresh danh sách tàu để cập nhật stats
    } catch (e: any) {
      console.error('Error generating carriages:', e);
      toast.dismiss(loadingToast);
      toast.error(e?.response?.data?.message || 'Không thể tạo toa và ghế. Vui lòng thử lại.');
    }
  };

  const handleEditTrain = (train: Train) => {
    setSelectedTrain(train);
    setFormData({
      train_code: train.train_code || '',
      train_name: train.train_name || '',
      template_id: typeof train.template_id === 'object' ? train.template_id._id : train.template_id || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateTrain = async () => {
    if (!selectedTrain) return;
    try {
      if (!formData.train_code || !formData.train_name || !formData.template_id) {
        toast.error('Vui lòng nhập đầy đủ thông tin');
        return;
      }
      await apiClient.put(`/trains/${selectedTrain._id}`, formData);
      toast.success('Cập nhật tàu thành công');
      setShowEditModal(false);
      setSelectedTrain(null);
      fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật tàu');
    }
  };

  const handleDeleteTrain = async (train: Train) => {
    if (confirm(`Bạn có chắc muốn xóa tàu ${train.train_code}?`)) {
      try {
        await apiClient.delete(`/trains/${train._id}`);
        toast.success(`Đã xóa tàu ${train.train_code}`);
        fetchData();
      } catch (error) {
        toast.error('Có lỗi xảy ra khi xóa tàu');
      }
    }
  };

  const trainStats = [
    { label: 'Tổng số tàu', value: trains.length, color: 'bg-blue-500' },
    { label: 'Đang hoạt động', value: trains.filter(t => t.status === 'active' || t.is_active).length, color: 'bg-green-500' },
    { label: 'Ngừng hoạt động', value: trains.filter(t => t.status === 'inactive' || (!t.is_active && t.status === undefined)).length, color: 'bg-gray-500' },
    { label: 'Tổng ghế', value: trains.reduce((sum, t) => sum + (t.capacity || 0), 0), color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản lý tàu</h1>
        <p className="text-muted-foreground mt-1">Quản lý tàu, toa, ghế và lịch trình</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {trainStats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-12 ${stat.color} rounded`} />
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Tabs - Only Trains tab remains */}
      <div className="border-b">
        <div className="flex gap-4">
          <button
            className="pb-3 px-1 font-medium border-b-2 border-primary text-primary transition-colors"
          >
            <TrainIcon className="w-4 h-4 inline mr-2" />
            Danh sách tàu
          </button>
        </div>
      </div>

      {/* Search & Actions */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Tìm theo mã tàu, tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm tàu mới
          </Button>
        </div>
      </Card>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTrains.map((train) => (
          <Card key={train._id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrainIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{train.train_code}</h3>
                  <p className="text-sm text-muted-foreground">{train.train_name}</p>
                </div>
              </div>
              {getStatusBadge(train.status || train.is_active)}
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Số toa:</span>
                <span className="font-medium">{train.total_carriages ? `${train.total_carriages} toa` : 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tổng ghế:</span>
                <span className="font-medium">{train.capacity ? `${train.capacity} ghế` : 'N/A'}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => handleViewMap(train)}>
                <Eye className="w-4 h-4 mr-2" />
                Sơ đồ
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleEditTrain(train)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Sửa
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-destructive hover:bg-destructive hover:text-white"
                onClick={() => handleDeleteTrain(train)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Xóa
              </Button>
            </div>
          </Card>
        ))}

        {filteredTrains.length === 0 && (
          <div className="col-span-2 text-center py-12 text-muted-foreground">
            Không tìm thấy tàu nào
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  Thêm tàu mới
                </h2>
                <button onClick={() => setShowAddModal(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Mã tàu</Label>
                    <Input
                      placeholder="L5-01"
                      value={formData.train_code}
                      onChange={(e: any) => setFormData({ ...formData, train_code: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tên tàu</Label>
                    <Input
                      placeholder="Tàu Tuyến 5"
                      value={formData.train_name}
                      onChange={(e: any) => setFormData({ ...formData, train_name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Mẫu tàu (Template)</Label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.template_id}
                    onChange={(e: any) => setFormData({ ...formData, template_id: e.target.value })}
                  >
                    {trainTemplates.map((tpl: any) => (
                      <option key={tpl._id} value={tpl._id}>{tpl.template_name}</option>
                    ))}
                  </select>
                </div>


                <div className="flex gap-3 pt-4">
                  <Button className="flex-1" onClick={handleAddTrain}>
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm tàu
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>
                    Hủy
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedTrain && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  Sửa thông tin tàu
                </h2>
                <button onClick={() => {
                  setShowEditModal(false);
                  setSelectedTrain(null);
                }}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Mã tàu</Label>
                    <Input
                      placeholder="L5-01"
                      value={formData.train_code}
                      onChange={(e: any) => setFormData({ ...formData, train_code: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tên tàu</Label>
                    <Input
                      placeholder="Tàu Tuyến 5"
                      value={formData.train_name}
                      onChange={(e: any) => setFormData({ ...formData, train_name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Mẫu tàu (Template)</Label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg"
                    value={formData.template_id}
                    onChange={(e: any) => setFormData({ ...formData, template_id: e.target.value })}
                  >
                    <option value="">Chọn template</option>
                    {trainTemplates.map((tpl: any) => (
                      <option key={tpl._id} value={tpl._id}>{tpl.template_name}</option>
                    ))}
                  </select>
                </div>


                <div className="flex gap-3 pt-4">
                  <Button className="flex-1" onClick={handleUpdateTrain}>
                    <Edit className="w-4 h-4 mr-2" />
                    Cập nhật
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => {
                    setShowEditModal(false);
                    setSelectedTrain(null);
                  }}>
                    Hủy
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Seat Map Modal */}
      {showSeatMapModal && selectedTrainForMap && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">
                      Sơ đồ ghế - Tàu {selectedTrainForMap.train_code}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Chọn chuyến (ngày/giờ) để xem tình trạng ghế theo từng ngày.
                    </p>
                  </div>
                  <button onClick={() => setShowSeatMapModal(false)}>
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {schedulesForMap.length > 0 && (
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <span className="text-sm font-medium text-muted-foreground">Chuyến / Ngày chạy:</span>
                    <select
                      className="px-3 py-2 border rounded-lg text-sm min-w-[260px]"
                      value={selectedScheduleIdForMap}
                      onChange={(e) => {
                        setSelectedScheduleIdForMap(e.target.value);
                      }}
                    >
                      {schedulesForMap.map((s: any) => (
                        <option key={s._id} value={s._id}>
                          {new Date(s.date).toLocaleDateString('vi-VN')} · {s.departure_time} - {s.arrival_time}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <SeatMap
                scheduleId={selectedScheduleIdForMap}
                schedule={schedulesForMap.find((s: any) => s._id === selectedScheduleIdForMap)}
                selectedSeats={[]}
                onSeatSelect={() => { }}
                onSeatDeselect={() => { }}
              />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
