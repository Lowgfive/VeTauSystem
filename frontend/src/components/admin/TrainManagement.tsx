import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Search, Plus, Edit, Trash2, Train as TrainIcon, Calendar, MapPin, Clock, X, Eye } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { Train, MetroLine, Carriage, Seat } from '../../types';
import { SeatMap } from '../SeatMap';

// Temporarily keep Schedule mock until Phase 3 (Schedule Management)
interface Schedule {
  id: string;
  trainCode: string;
  route: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  frequency: string;
  status: 'active' | 'cancelled';
}

export function TrainManagement() {
  const [activeTab, setActiveTab] = useState<'trains' | 'schedules'>('trains');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState<Train | null>(null);

  const [showSeatMapModal, setShowSeatMapModal] = useState(false);
  const [selectedTrainForMap, setSelectedTrainForMap] = useState<Train | null>(null);
  const [carriagesForMap, setCarriagesForMap] = useState<Carriage[]>([]);
  const [seatsForMap, setSeatsForMap] = useState<Record<string, Seat[]>>({});

  const [trains, setTrains] = useState<Train[]>([]);
  const [lines, setLines] = useState<MetroLine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    train_code: '',
    train_name: '',
    template_id: '',
    line_id: ''
  });

  const [trainTemplates, setTrainTemplates] = useState<any[]>([]);

  // API Base URL
  const API_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [trainsRes, linesRes, templatesRes] = await Promise.all([
        axios.get(`${API_URL}/trains`),
        axios.get(`${API_URL}/metrolines`),
        axios.get(`${API_URL}/templates/trains`)
      ]);
      setTrains(trainsRes.data.data);
      setLines(linesRes.data.data);
      setTrainTemplates(templatesRes.data.data);

      if (linesRes.data.data.length > 0) {
        setFormData(prev => ({
          ...prev,
          line_id: linesRes.data.data[0]._id,
          template_id: templatesRes.data.data[0]?._id || ''
        }));
      }
    } catch (error) {
      console.error('Lỗi khi fetch data:', error);
      toast.error('Không thể tải dữ liệu đoàn tàu.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Mock data - Schedules
  const mockSchedules: Schedule[] = [
    {
      id: '1',
      trainCode: 'L5-01',
      route: 'Văn Cao → Hòa Lạc',
      departureTime: '06:00',
      arrivalTime: '06:45',
      duration: '45m',
      frequency: '10 phút/chuyến',
      status: 'active',
    }
  ];

  const [schedules] = useState<Schedule[]>(mockSchedules);

  const filteredTrains = trains.filter(train =>
    train.train_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    train.train_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSchedules = schedules.filter(schedule =>
    schedule.trainCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    schedule.route.toLowerCase().includes(searchTerm.toLowerCase())
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
      <Badge className="bg-red-100 text-red-800">Đã hủy</Badge>
    );
  };

  const handleAddTrain = async () => {
    try {
      if (!formData.train_code || !formData.train_name || !formData.line_id || !formData.template_id) {
        toast.error('Vui lòng nhập đầy đủ thông tin (bao gồm mã mẫu tàu)');
        return;
      }
      await axios.post(`${API_URL}/trains`, formData);
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
      const res = await axios.get(`${API_URL}/trains/${train._id}/seatmap`);
      setCarriagesForMap(res.data.data.carriages);
      setSeatsForMap(res.data.data.seatsByCarriage);
      setShowSeatMapModal(true);
    } catch (e) {
      toast.error('Không thể tải sơ đồ ghế');
    }
  };

  const handleEditTrain = (train: Train) => {
    setSelectedTrain(train);
    toast.success('Chức năng đang phát triển');
  };

  const handleDeleteTrain = async (train: Train) => {
    if (confirm(`Bạn có chắc muốn xóa tàu ${train.train_code}?`)) {
      try {
        await axios.delete(`${API_URL}/trains/${train._id}`);
        toast.success(`Đã xóa tàu ${train.train_code}`);
        fetchData();
      } catch (error) {
        toast.error('Có lỗi xảy ra khi xóa tàu');
      }
    }
  };

  const trainStats = [
    { label: 'Tổng số tàu', value: trains.length, color: 'bg-blue-500' },
    { label: 'Đang hoạt động', value: trains.filter(t => t.is_active).length, color: 'bg-green-500' },
    { label: 'Ngừng hoạt động', value: trains.filter(t => !t.is_active).length, color: 'bg-gray-500' },
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

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('trains')}
            className={`pb-3 px-1 font-medium border-b-2 transition-colors ${activeTab === 'trains'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-gray-900'
              }`}
          >
            <TrainIcon className="w-4 h-4 inline mr-2" />
            Danh sách tàu
          </button>
          <button
            onClick={() => setActiveTab('schedules')}
            className={`pb-3 px-1 font-medium border-b-2 transition-colors ${activeTab === 'schedules'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-gray-900'
              }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Lịch trình
          </button>
        </div>
      </div>

      {/* Search & Actions */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder={activeTab === 'trains' ? 'Tìm theo mã tàu, tên...' : 'Tìm theo mã tàu, tuyến đường...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {activeTab === 'trains' ? 'Thêm tàu mới' : 'Thêm lịch trình'}
          </Button>
        </div>
      </Card>

      {/* Trains List */}
      {activeTab === 'trains' && (
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
                {getStatusBadge(train.is_active)}
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Loại tàu:</span>
                  <span className="font-medium">{train.train_type}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Số toa:</span>
                  <span className="font-medium">{train.total_carriages} toa</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tổng ghế:</span>
                  <span className="font-medium">{train.capacity} ghế</span>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground mb-1">Tuyến đường:</p>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {typeof train.line_id === 'object' ? (train.line_id as MetroLine).line_name : 'Line 5'}
                    </Badge>
                  </div>
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
      )}

      {/* Schedules List */}
      {activeTab === 'schedules' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Mã tàu</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Tuyến đường</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Giờ khởi hành</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Giờ đến</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Thời gian</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Tần suất</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Trạng thái</th>
                  <th className="text-center py-3 px-4 font-semibold text-sm text-gray-700">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchedules.map((schedule) => (
                  <tr key={schedule.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <TrainIcon className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{schedule.trainCode}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{schedule.route}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{schedule.departureTime}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">{schedule.arrivalTime}</td>
                    <td className="py-3 px-4 text-sm">{schedule.duration}</td>
                    <td className="py-3 px-4 text-sm">{schedule.frequency}</td>
                    <td className="py-3 px-4">{getStatusBadge(schedule.status)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSchedules.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              Không tìm thấy lịch trình nào
            </div>
          )}
        </Card>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {activeTab === 'trains' ? 'Thêm tàu mới' : 'Thêm lịch trình mới'}
                </h2>
                <button onClick={() => setShowAddModal(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              {activeTab === 'trains' ? (
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

                  <div className="space-y-2">
                    <Label>Tuyến đường</Label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg"
                      value={formData.line_id}
                      onChange={(e: any) => setFormData({ ...formData, line_id: e.target.value })}
                    >
                      {lines.map((line: any) => (
                        <option key={line._id} value={line._id}>{line.line_name}</option>
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
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Mã tàu</Label>
                    <select className="w-full px-3 py-2 border rounded-lg">
                      {trains.map(train => (
                        <option key={train._id} value={train.train_code}>{train.train_code} - {train.train_name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Tuyến đường</Label>
                    <Input placeholder="Hà Nội → Sài Gòn" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Giờ khởi hành</Label>
                      <Input type="time" />
                    </div>
                    <div className="space-y-2">
                      <Label>Giờ đến</Label>
                      <Input type="time" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Tần suất</Label>
                    <select className="w-full px-3 py-2 border rounded-lg">
                      <option>Hàng ngày</option>
                      <option>Thứ 2, 4, 6</option>
                      <option>Thứ 3, 5, 7</option>
                      <option>Cuối tuần</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button className="flex-1" onClick={handleAddTrain}>
                      <Plus className="w-4 h-4 mr-2" />
                      Thêm lịch trình
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>
                      Hủy
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Seat Map Modal */}
      {showSeatMapModal && selectedTrainForMap && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  Sơ đồ ghế - Tàu {selectedTrainForMap.train_code}
                </h2>
                <button onClick={() => setShowSeatMapModal(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              <SeatMap
                carriages={carriagesForMap}
                seatsData={seatsForMap}
                readOnly={true}
              />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
