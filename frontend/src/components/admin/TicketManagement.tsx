import { useState } from 'react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Search, Filter, Download, Eye, X, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Ticket {
  id: string;
  bookingCode: string;
  passengerName: string;
  phone: string;
  email: string;
  trainCode: string;
  route: string;
  departureDate: string;
  departureTime: string;
  seatNumber: string;
  seatType: string;
  price: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  paymentMethod: string;
  bookingDate: string;
}

export function TicketManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Mock data
  const mockTickets: Ticket[] = [
    {
      id: '1',
      bookingCode: 'VNR-2024-001234',
      passengerName: 'Nguyễn Văn A',
      phone: '0912345678',
      email: 'nguyenvana@email.com',
      trainCode: 'SE1',
      route: 'Hà Nội → Sài Gòn',
      departureDate: '15/02/2026',
      departureTime: '19:30',
      seatNumber: '1A5',
      seatType: 'Giường nằm mềm điều hòa',
      price: 1250000,
      status: 'confirmed',
      paymentMethod: 'Thẻ tín dụng',
      bookingDate: '10/02/2026 14:30',
    },
    {
      id: '2',
      bookingCode: 'VNR-2024-001235',
      passengerName: 'Trần Thị B',
      phone: '0923456789',
      email: 'tranthib@email.com',
      trainCode: 'SE3',
      route: 'Sài Gòn → Đà Nẵng',
      departureDate: '15/02/2026',
      departureTime: '07:00',
      seatNumber: '2B12',
      seatType: 'Ngồi mềm điều hòa',
      price: 850000,
      status: 'confirmed',
      paymentMethod: 'MoMo',
      bookingDate: '11/02/2026 09:15',
    },
    {
      id: '3',
      bookingCode: 'VNR-2024-001236',
      passengerName: 'Lê Văn C',
      phone: '0934567890',
      email: 'levanc@email.com',
      trainCode: 'SE7',
      route: 'Hà Nội → Huế',
      departureDate: '16/02/2026',
      departureTime: '14:15',
      seatNumber: '3C8',
      seatType: 'Giường nằm cứng',
      price: 680000,
      status: 'pending',
      paymentMethod: 'Chuyển khoản',
      bookingDate: '12/02/2026 16:45',
    },
    {
      id: '4',
      bookingCode: 'VNR-2024-001237',
      passengerName: 'Phạm Thị D',
      phone: '0945678901',
      email: 'phamthid@email.com',
      trainCode: 'SE4',
      route: 'Đà Nẵng → Nha Trang',
      departureDate: '16/02/2026',
      departureTime: '10:30',
      seatNumber: '1A15',
      seatType: 'Giường nằm mềm điều hòa',
      price: 560000,
      status: 'confirmed',
      paymentMethod: 'VNPay',
      bookingDate: '13/02/2026 11:20',
    },
    {
      id: '5',
      bookingCode: 'VNR-2024-001238',
      passengerName: 'Hoàng Văn E',
      phone: '0956789012',
      email: 'hoangvane@email.com',
      trainCode: 'SE1',
      route: 'Hà Nội → Sài Gòn',
      departureDate: '17/02/2026',
      departureTime: '19:30',
      seatNumber: '2B7',
      seatType: 'Ngồi mềm điều hòa',
      price: 950000,
      status: 'cancelled',
      paymentMethod: 'Thẻ tín dụng',
      bookingDate: '09/02/2026 10:00',
    },
    {
      id: '6',
      bookingCode: 'VNR-2024-001239',
      passengerName: 'Võ Thị F',
      phone: '0967890123',
      email: 'vothif@email.com',
      trainCode: 'SE2',
      route: 'Sài Gòn → Hà Nội',
      departureDate: '14/02/2026',
      departureTime: '19:00',
      seatNumber: '1C20',
      seatType: 'Giường nằm mềm điều hòa',
      price: 1250000,
      status: 'completed',
      paymentMethod: 'MoMo',
      bookingDate: '08/02/2026 15:30',
    },
  ];

  const [tickets] = useState<Ticket[]>(mockTickets);

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.bookingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.phone.includes(searchTerm) ||
      ticket.trainCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleCancelTicket = (ticket: Ticket) => {
    if (ticket.status === 'cancelled') {
      toast.error('Vé đã được hủy trước đó');
      return;
    }
    
    toast.success(`Đã hủy vé ${ticket.bookingCode}`);
    setSelectedTicket(null);
  };

  const handleConfirmTicket = (ticket: Ticket) => {
    if (ticket.status === 'confirmed') {
      toast.error('Vé đã được xác nhận');
      return;
    }
    
    toast.success(`Đã xác nhận vé ${ticket.bookingCode}`);
    setSelectedTicket(null);
  };

  const getStatusBadge = (status: Ticket['status']) => {
    const configs = {
      confirmed: { label: 'Đã xác nhận', className: 'bg-green-100 text-green-800', icon: CheckCircle },
      pending: { label: 'Chờ xử lý', className: 'bg-yellow-100 text-yellow-800', icon: Clock },
      cancelled: { label: 'Đã hủy', className: 'bg-red-100 text-red-800', icon: XCircle },
      completed: { label: 'Hoàn thành', className: 'bg-blue-100 text-blue-800', icon: CheckCircle },
    };
    
    const config = configs[status];
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.className} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const stats = [
    { label: 'Tổng vé', value: tickets.length, color: 'bg-blue-500' },
    { label: 'Đã xác nhận', value: tickets.filter(t => t.status === 'confirmed').length, color: 'bg-green-500' },
    { label: 'Chờ xử lý', value: tickets.filter(t => t.status === 'pending').length, color: 'bg-yellow-500' },
    { label: 'Đã hủy', value: tickets.filter(t => t.status === 'cancelled').length, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Quản lý vé</h1>
        <p className="text-muted-foreground mt-1">Quản lý và theo dõi tất cả vé đã đặt</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
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

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Tìm theo mã vé, tên, số điện thoại, mã tàu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg text-sm bg-white"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="pending">Chờ xử lý</option>
              <option value="cancelled">Đã hủy</option>
              <option value="completed">Hoàn thành</option>
            </select>
            
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Lọc
            </Button>
            
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Xuất Excel
            </Button>
          </div>
        </div>
      </Card>

      {/* Tickets Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Mã vé</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Hành khách</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Chuyến tàu</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Khởi hành</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Ghế</th>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Trạng thái</th>
                <th className="text-right py-3 px-4 font-semibold text-sm text-gray-700">Giá tiền</th>
                <th className="text-center py-3 px-4 font-semibold text-sm text-gray-700">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="font-medium text-sm">{ticket.bookingCode}</p>
                    <p className="text-xs text-muted-foreground">{ticket.bookingDate}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-sm">{ticket.passengerName}</p>
                    <p className="text-xs text-muted-foreground">{ticket.phone}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-sm">{ticket.trainCode}</p>
                    <p className="text-xs text-muted-foreground">{ticket.route}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm">{ticket.departureDate}</p>
                    <p className="text-xs text-muted-foreground">{ticket.departureTime}</p>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="outline">{ticket.seatNumber}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(ticket.status)}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-sm">
                    {new Intl.NumberFormat('vi-VN').format(ticket.price)} ₫
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTickets.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            Không tìm thấy vé nào
          </div>
        )}
      </Card>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Chi tiết vé</h2>
                <button onClick={() => setSelectedTicket(null)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Booking Info */}
                <div>
                  <h3 className="font-semibold mb-3 text-lg">Thông tin đặt vé</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Mã vé</p>
                      <p className="font-medium">{selectedTicket.bookingCode}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Ngày đặt</p>
                      <p className="font-medium">{selectedTicket.bookingDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Trạng thái</p>
                      <div className="mt-1">{getStatusBadge(selectedTicket.status)}</div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Thanh toán</p>
                      <p className="font-medium">{selectedTicket.paymentMethod}</p>
                    </div>
                  </div>
                </div>

                {/* Passenger Info */}
                <div>
                  <h3 className="font-semibold mb-3 text-lg">Thông tin hành khách</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Họ và tên</p>
                      <p className="font-medium">{selectedTicket.passengerName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Số điện thoại</p>
                      <p className="font-medium">{selectedTicket.phone}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedTicket.email}</p>
                    </div>
                  </div>
                </div>

                {/* Trip Info */}
                <div>
                  <h3 className="font-semibold mb-3 text-lg">Thông tin chuyến đi</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Mã tàu</p>
                      <p className="font-medium">{selectedTicket.trainCode}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tuyến đường</p>
                      <p className="font-medium">{selectedTicket.route}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Ngày khởi hành</p>
                      <p className="font-medium">{selectedTicket.departureDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Giờ khởi hành</p>
                      <p className="font-medium">{selectedTicket.departureTime}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Số ghế</p>
                      <p className="font-medium">{selectedTicket.seatNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Loại ghế</p>
                      <p className="font-medium">{selectedTicket.seatType}</p>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Tổng cộng:</span>
                    <span className="text-2xl font-bold text-primary">
                      {new Intl.NumberFormat('vi-VN').format(selectedTicket.price)} ₫
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  {selectedTicket.status === 'pending' && (
                    <Button 
                      className="flex-1"
                      onClick={() => handleConfirmTicket(selectedTicket)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Xác nhận vé
                    </Button>
                  )}
                  {selectedTicket.status !== 'cancelled' && selectedTicket.status !== 'completed' && (
                    <Button 
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleCancelTicket(selectedTicket)}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Hủy vé
                    </Button>
                  )}
                  <Button variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    In vé
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
