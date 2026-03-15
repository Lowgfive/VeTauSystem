import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { Loader2, Train as TrainIcon, CalendarClock, PenLine } from 'lucide-react';
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { format } from 'date-fns';

const API_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';

export function ScheduleManagement() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [trains, setTrains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Generating state
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTrainForGen, setSelectedTrainForGen] = useState<string>('');
  
  // Edit modal state
  const [editingSchedule, setEditingSchedule] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    departure_time: '',
    arrival_time: '',
    status: 'SCHEDULED'
  });

  useEffect(() => {
    fetchSchedules();
    fetchTrains();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/schedules`);
      setSchedules(res.data.data || []);
    } catch (error) {
      toast.error('Không thể tải danh sách lịch tàu');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrains = async () => {
    try {
      const res = await axios.get(`${API_URL}/trains`);
      setTrains(res.data.data || []);
    } catch (error) {
      console.error('Lỗi khi tải danh sách tàu', error);
    }
  };

  const handleGenerateSchedules = async () => {
    if (!selectedTrainForGen) {
      toast.error('Vui lòng chọn tàu để tạo lịch');
      return;
    }
    
    try {
      setIsGenerating(true);
      const res = await axios.post(`${API_URL}/schedules/auto-generate`, {
        trainId: selectedTrainForGen,
        maxDays: 30
      });
      
      toast.success(res.data.message || 'Khởi tạo lịch thành công');
      fetchSchedules();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi khi tự động tạo lịch');
    } finally {
      setIsGenerating(false);
    }
  };

  const openEditModal = (sched: any) => {
    setEditingSchedule(sched);
    setEditForm({
      departure_time: sched.departure_time,
      arrival_time: sched.arrival_time,
      status: sched.status || 'SCHEDULED'
    });
  };

  const handleUpdateSchedule = async () => {
    if (!editingSchedule) return;

    // Validate: Arrival must be after Departure
    const [depH, depM] = editForm.departure_time.split(':').map(Number);
    const [arrH, arrM] = editForm.arrival_time.split(':').map(Number);
    const depTotal = depH * 60 + depM;
    const arrTotal = arrH * 60 + arrM;

    if (arrTotal <= depTotal) {
      toast.error('Lỗi: Giờ đến phải sau giờ khởi hành!');
      return;
    }

    try {
      await axios.patch(`${API_URL}/schedules/${editingSchedule._id}`, editForm);
      toast.success('Cập nhật chuyến tàu thành công!');
      setEditingSchedule(null);
      fetchSchedules();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật chuyến tàu');
    }
  };

  const statusColors: any = {
    'SCHEDULED': 'bg-blue-100 text-blue-800',
    'DELAYED': 'bg-yellow-100 text-yellow-800',
    'CANCELLED': 'bg-red-100 text-red-800',
    'MAINTENANCE': 'bg-orange-100 text-orange-800',
  };

  const statusLabels: any = {
    'SCHEDULED': 'Chờ khởi hành',
    'DELAYED': 'Trễ chuyến',
    'CANCELLED': 'Đã hủy',
    'MAINTENANCE': 'Bảo trì',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 left to-sky-600 text-transparent bg-clip-text">Quản lý Lịch Tàu</h2>
          <p className="text-muted-foreground mt-1">Sửa đổi, hủy hoặc cập nhật trạng thái bảo trì chuyến đi</p>
        </div>

        <Card className="p-2 border border-blue-100 shadow-sm bg-blue-50/50 flex gap-2 w-full sm:w-auto">
          <Select value={selectedTrainForGen} onValueChange={setSelectedTrainForGen}>
            <SelectTrigger className="w-[180px] bg-white border-blue-200">
              <SelectValue placeholder="Chọn mã tàu..." />
            </SelectTrigger>
            <SelectContent>
              {trains.filter(t => t.status === 'active').map(t => (
                <SelectItem key={t._id} value={t._id}>
                  {t.train_code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={handleGenerateSchedules} 
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CalendarClock className="w-4 h-4 mr-2" />}
            Sinh lịch (30 ngày)
          </Button>
        </Card>
      </div>

      <Card className="overflow-hidden border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/80 border-b text-gray-500 font-medium">
              <tr>
                <th className="py-4 px-4 text-left">Chuyến</th>
                <th className="py-4 px-4 text-left">Ngày chạy</th>
                <th className="py-4 px-4 text-left">Lộ trình</th>
                <th className="py-4 px-4 text-left">Giờ chạy</th>
                <th className="py-4 px-4 text-left">Trạng thái</th>
                <th className="py-4 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500 mb-2" />
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : schedules.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    Không có lịch chạy nào. Hãy chọn tàu và bấm "Sinh lịch".
                  </td>
                </tr>
              ) : (
                schedules.map((sched) => (
                  <tr key={sched._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 font-medium">
                        <TrainIcon className="w-4 h-4 text-blue-600" />
                        {sched.train_id?.train_code || 'N/A'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {format(new Date(sched.date), 'dd/MM/yyyy')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-xs font-medium text-gray-600">
                        {sched.route_id?.departure_station_id?.station_name || '?'} 
                        <span className="mx-1 text-gray-400">→</span> 
                        {sched.route_id?.arrival_station_id?.station_name || '?'}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-700">
                      {sched.departure_time} - {sched.arrival_time}
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={`${statusColors[sched.status || 'SCHEDULED']} font-normal hover:bg-opacity-80`}>
                        {statusLabels[sched.status || 'SCHEDULED']}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button variant="ghost" size="sm" onClick={() => openEditModal(sched)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                        <PenLine className="w-4 h-4 mr-1" /> Cập nhật
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Modal */}
      <Dialog open={!!editingSchedule} onOpenChange={() => setEditingSchedule(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-blue-600" /> Cập nhật chuyến đi
            </DialogTitle>
            <VisuallyHidden.Root>
              <DialogDescription>
                Chỉnh sửa giờ xuất phát, giờ đến và trạng thái của chuyến tàu.
              </DialogDescription>
            </VisuallyHidden.Root>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Giờ khởi hành
                </Label>
                <div className="relative group">
                  <Input 
                    type="time" 
                    value={editForm.departure_time} 
                    onChange={(e) => setEditForm(prev => ({...prev, departure_time: e.target.value}))}
                    className="pl-3 py-5 text-lg font-medium border-gray-200 focus:border-blue-500 transition-all cursor-pointer"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Giờ đến nơi
                </Label>
                <div className="relative group">
                  <Input 
                    type="time" 
                    value={editForm.arrival_time} 
                    onChange={(e) => setEditForm(prev => ({...prev, arrival_time: e.target.value}))}
                    className="pl-3 py-5 text-lg font-medium border-gray-200 focus:border-emerald-500 transition-all cursor-pointer"
                  />
                </div>
              </div>
            </div>
            
            <p className="text-[11px] text-muted-foreground bg-blue-50/50 p-2 rounded border border-blue-100/50 flex items-center gap-2">
              <span className="text-blue-500 font-bold">●</span> Quy tắc: Giờ đến phải sau giờ khởi hành và nằm trong cùng một ngày vận hành.
            </p>
            
            <div className="space-y-2 mt-2">
              <Label>Trạng thái chuyến đi</Label>
              <Select value={editForm.status} onValueChange={(val: string) => setEditForm(prev => ({...prev, status: val}))}>
                <SelectTrigger>
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SCHEDULED">Chờ khởi hành</SelectItem>
                  <SelectItem value="DELAYED">Trễ chuyến</SelectItem>
                  <SelectItem value="CANCELLED">Hủy chuyến (Cancelled)</SelectItem>
                  <SelectItem value="MAINTENANCE">Bảo trì (Maintenance)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSchedule(null)}>Hủy bỏ</Button>
            <Button onClick={handleUpdateSchedule} className="bg-blue-600 hover:bg-blue-700 text-white">Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
