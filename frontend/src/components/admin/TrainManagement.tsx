import { useState } from 'react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Search, Plus, Edit, Trash2, Train, Calendar, MapPin, Clock, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface TrainData {
  id: string;
  code: string;
  name: string;
  type: string;
  totalCoaches: number;
  totalSeats: number;
  status: 'active' | 'maintenance' | 'inactive';
  routes: string[];
}

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
  const [selectedTrain, setSelectedTrain] = useState<TrainData | null>(null);

  // Mock data - Trains
  const mockTrains: TrainData[] = [
    {
      id: '1',
      code: 'SE1',
      name: 'Thống Nhất',
      type: 'Tàu cao tốc',
      totalCoaches: 12,
      totalSeats: 864,
      status: 'active',
      routes: ['Hà Nội - Sài Gòn'],
    },
    {
      id: '2',
      code: 'SE2',
      name: 'Thống Nhất',
      type: 'Tàu cao tốc',
      totalCoaches: 12,
      totalSeats: 864,
      status: 'active',
      routes: ['Sài Gòn - Hà Nội'],
    },
    {
      id: '3',
      code: 'SE3',
      name: 'Bắc Nam',
      type: 'Tàu thường',
      totalCoaches: 10,
      totalSeats: 720,
      status: 'active',
      routes: ['Hà Nội - Đà Nẵng', 'Đà Nẵng - Hà Nội'],
    },
    {
      id: '4',
      code: 'SE7',
      name: 'Huế',
      type: 'Tàu thường',
      totalCoaches: 8,
      totalSeats: 576,
      status: 'active',
      routes: ['Hà Nội - Huế', 'Huế - Hà Nội'],
    },
    {
      id: '5',
      code: 'TN1',
      name: 'Sài Gòn - Nha Trang',
      type: 'Tàu thường',
      totalCoaches: 10,
      totalSeats: 720,
      status: 'maintenance',
      routes: ['Sài Gòn - Nha Trang'],
    },
  ];

  // Mock data - Schedules
  const mockSchedules: Schedule[] = [
    {
      id: '1',
      trainCode: 'SE1',
      route: 'Hà Nội → Sài Gòn',
      departureTime: '19:30',
      arrivalTime: '10:30+1',
      duration: '31h 00m',
      frequency: 'Hàng ngày',
      status: 'active',
    },
    {
      id: '2',
      trainCode: 'SE2',
      route: 'Sài Gòn → Hà Nội',
      departureTime: '19:00',
      arrivalTime: '04:00+2',
      duration: '31h 00m',
      frequency: 'Hàng ngày',
      status: 'active',
    },
    {
      id: '3',
      trainCode: 'SE3',
      route: 'Hà Nội → Đà Nẵng',
      departureTime: '07:00',
      arrivalTime: '22:30',
      duration: '15h 30m',
      frequency: 'Hàng ngày',
      status: 'active',
    },
    {
      id: '4',
      trainCode: 'SE7',
      route: 'Hà Nội → Huế',
      departureTime: '14:15',
      arrivalTime: '04:45+1',
      duration: '14h 30m',
      frequency: 'Hàng ngày',
      status: 'active',
    },
    {
      id: '5',
      trainCode: 'TN1',
      route: 'Sài Gòn → Nha Trang',
      departureTime: '23:00',
      arrivalTime: '07:30+1',
      duration: '8h 30m',
      frequency: 'Thứ 2, 4, 6',
      status: 'cancelled',
    },
  ];

  const [trains] = useState<TrainData[]>(mockTrains);
  const [schedules] = useState<Schedule[]>(mockSchedules);

  const filteredTrains = trains.filter(train =>
    train.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    train.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSchedules = schedules.filter(schedule =>
    schedule.trainCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    schedule.route.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const configs = {
      active: { label: 'Hoạt động', className: 'bg-green-100 text-green-800' },
      maintenance: { label: 'Bảo trì', className: 'bg-yellow-100 text-yellow-800' },
      inactive: { label: 'Ngừng hoạt động', className: 'bg-gray-100 text-gray-800' },
      cancelled: { label: 'Đã hủy', className: 'bg-red-100 text-red-800' },
    };
    
    const config = configs[status as keyof typeof configs];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const handleAddTrain = () => {
    toast.success('Chức năng đang phát triển');
    setShowAddModal(false);
  };

  const handleEditTrain = (train: TrainData) => {
    setSelectedTrain(train);
    toast.success('Chức năng đang phát triển');
  };

  const handleDeleteTrain = (train: TrainData) => {
    if (confirm(`Bạn có chắc muốn xóa tàu ${train.code}?`)) {
      toast.success(`Đã xóa tàu ${train.code}`);
    }
  };

  const trainStats = [
    { label: 'Tổng số tàu', value: trains.length, color: 'bg-blue-500' },
    { label: 'Đang hoạt động', value: trains.filter(t => t.status === 'active').length, color: 'bg-green-500' },
    { label: 'Đang bảo trì', value: trains.filter(t => t.status === 'maintenance').length, color: 'bg-yellow-500' },
    { label: 'Tổng ghế', value: trains.reduce((sum, t) => sum + t.totalSeats, 0), color: 'bg-purple-500' },
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
            className={`pb-3 px-1 font-medium border-b-2 transition-colors ${
              activeTab === 'trains'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-gray-900'
            }`}
          >
            <Train className="w-4 h-4 inline mr-2" />
            Danh sách tàu
          </button>
          <button
            onClick={() => setActiveTab('schedules')}
            className={`pb-3 px-1 font-medium border-b-2 transition-colors ${
              activeTab === 'schedules'
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
            <Card key={train.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Train className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{train.code}</h3>
                    <p className="text-sm text-muted-foreground">{train.name}</p>
                  </div>
                </div>
                {getStatusBadge(train.status)}
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Loại tàu:</span>
                  <span className="font-medium">{train.type}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Số toa:</span>
                  <span className="font-medium">{train.totalCoaches} toa</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tổng ghế:</span>
                  <span className="font-medium">{train.totalSeats} ghế</span>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground mb-1">Tuyến đường:</p>
                  <div className="flex flex-wrap gap-1">
                    {train.routes.map((route, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {route}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
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
                        <Train className="w-4 h-4 text-muted-foreground" />
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
                      <Input placeholder="SE10" />
                    </div>
                    <div className="space-y-2">
                      <Label>Tên tàu</Label>
                      <Input placeholder="Thống Nhất" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Loại tàu</Label>
                    <select className="w-full px-3 py-2 border rounded-lg">
                      <option>Tàu cao tốc</option>
                      <option>Tàu thường</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Số toa</Label>
                      <Input type="number" placeholder="12" />
                    </div>
                    <div className="space-y-2">
                      <Label>Tổng số ghế</Label>
                      <Input type="number" placeholder="864" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Trạng thái</Label>
                    <select className="w-full px-3 py-2 border rounded-lg">
                      <option value="active">Hoạt động</option>
                      <option value="maintenance">Bảo trì</option>
                      <option value="inactive">Ngừng hoạt động</option>
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
                        <option key={train.id} value={train.code}>{train.code} - {train.name}</option>
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
    </div>
  );
}
