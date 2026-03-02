import { useState, useMemo } from 'react';
import { 
  Train, ArrowLeft, Search, Filter, Calendar, MapPin, 
  Clock, Ticket, ChevronRight, Download, X, AlertCircle,
  CheckCircle, XCircle, Package
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Booking } from '../types';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';

interface MyBookingsPageProps {
  bookings: Booking[];
  onBack: () => void;
  onViewDetails: (booking: Booking) => void;
  onCancelBooking: (bookingId: string) => void;
}

export function MyBookingsPage({ 
  bookings, 
  onBack, 
  onViewDetails,
  onCancelBooking 
}: MyBookingsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'cancelled' | 'completed'>('all');

  // Filter bookings
  const filteredBookings = useMemo(() => {
    let filtered = bookings;

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(b => 
        b.bookingCode.toLowerCase().includes(query) ||
        b.trainNumber.toLowerCase().includes(query) ||
        b.route.origin.toLowerCase().includes(query) ||
        b.route.destination.toLowerCase().includes(query)
      );
    }

    // Sort by date (newest first)
    return filtered.sort((a, b) => 
      new Date(b.departureDateTime).getTime() - new Date(a.departureDateTime).getTime()
    );
  }, [bookings, statusFilter, searchQuery]);

  // Count by status
  const counts = useMemo(() => {
    return {
      all: bookings.length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
    };
  }, [bookings]);

  const getStatusConfig = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return {
          icon: CheckCircle,
          label: 'Đã xác nhận',
          className: 'bg-success/10 text-success border-success/20',
          iconClassName: 'text-success'
        };
      case 'completed':
        return {
          icon: CheckCircle,
          label: 'Đã hoàn thành',
          className: 'bg-gray-100 text-gray-600 border-gray-200',
          iconClassName: 'text-gray-600'
        };
      case 'cancelled':
        return {
          icon: XCircle,
          label: 'Đã hủy',
          className: 'bg-destructive/10 text-destructive border-destructive/20',
          iconClassName: 'text-destructive'
        };
      default:
        return {
          icon: AlertCircle,
          label: 'Đang xử lý',
          className: 'bg-warning/10 text-warning border-warning/20',
          iconClassName: 'text-warning'
        };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-primary text-white shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <Ticket className="w-6 h-6" />
              <div>
                <h1 className="text-xl font-bold">Vé của tôi</h1>
                <p className="text-xs text-white/80">Quản lý đặt vé của bạn</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Search & Filters */}
        <Card className="p-6 mb-6 shadow-md border-0">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Tìm theo mã đặt vé, số tàu, ga đi/đến..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 border-2 focus:border-primary"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Status Filter Tabs */}
            <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)} className="w-full">
              <TabsList className="grid grid-cols-4 w-full h-auto p-1 bg-gray-100">
                <TabsTrigger value="all" className="data-[state=active]:bg-white">
                  Tất cả
                  <Badge variant="secondary" className="ml-2 px-2 py-0 text-xs">
                    {counts.all}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="confirmed" className="data-[state=active]:bg-white">
                  Sắp tới
                  <Badge variant="secondary" className="ml-2 px-2 py-0 text-xs">
                    {counts.confirmed}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="completed" className="data-[state=active]:bg-white">
                  Đã đi
                  <Badge variant="secondary" className="ml-2 px-2 py-0 text-xs">
                    {counts.completed}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="cancelled" className="data-[state=active]:bg-white">
                  Đã hủy
                  <Badge variant="secondary" className="ml-2 px-2 py-0 text-xs">
                    {counts.cancelled}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            Hiển thị <span className="font-semibold text-gray-900">{filteredBookings.length}</span> vé
            {searchQuery && <span> cho "{searchQuery}"</span>}
          </p>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <Card className="p-12 text-center border-0 shadow-md">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? 'Không tìm thấy vé' : 'Chưa có vé nào'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery 
                  ? 'Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc'
                  : 'Bạn chưa có vé nào. Hãy đặt vé để bắt đầu hành trình!'
                }
              </p>
              {searchQuery ? (
                <Button variant="outline" onClick={() => setSearchQuery('')}>
                  <X className="w-4 h-4 mr-2" />
                  Xóa tìm kiếm
                </Button>
              ) : (
                <Button onClick={onBack}>
                  <Train className="w-4 h-4 mr-2" />
                  Đặt vé ngay
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const statusConfig = getStatusConfig(booking.status);
              const StatusIcon = statusConfig.icon;
              const canCancel = booking.status === 'confirmed';

              return (
                <Card 
                  key={booking.bookingCode}
                  className="overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Train className="w-5 h-5 text-primary" />
                          <span className="font-bold text-lg">{booking.trainNumber}</span>
                          <Badge variant="outline" className="ml-2">
                            {booking.bookingCode}
                          </Badge>
                        </div>
                        <Badge className={statusConfig.className}>
                          <StatusIcon className={`w-3 h-3 mr-1 ${statusConfig.iconClassName}`} />
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {formatCurrency(booking.totalAmount)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {booking.seats.length} ghế
                        </div>
                      </div>
                    </div>

                    {/* Route */}
                    <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center mb-4">
                      <div>
                        <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                          <MapPin className="w-4 h-4" />
                          <span>Ga đi</span>
                        </div>
                        <div className="font-semibold text-lg">{booking.route.origin}</div>
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(booking.departureDateTime)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Clock className="w-3 h-3" />
                          <span>{booking.departureTime}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-center">
                        <ChevronRight className="w-6 h-6 text-primary" />
                        <div className="text-xs text-gray-500 mt-1">
                          {booking.duration}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                          <MapPin className="w-4 h-4" />
                          <span>Ga đến</span>
                        </div>
                        <div className="font-semibold text-lg">{booking.route.destination}</div>
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(booking.arrivalDateTime)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Clock className="w-3 h-3" />
                          <span>{booking.arrivalTime}</span>
                        </div>
                      </div>
                    </div>

                    {/* Seats */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="text-xs text-gray-600 mb-2">Ghế đã chọn</div>
                      <div className="flex flex-wrap gap-2">
                        {booking.seats.map((seat) => (
                          <Badge key={seat.id} variant="secondary" className="font-mono">
                            {seat.number}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant="default"
                        onClick={() => onViewDetails(booking)}
                        className="flex-1"
                      >
                        <Ticket className="w-4 h-4 mr-2" />
                        Xem chi tiết
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Tải vé
                      </Button>
                      {canCancel && (
                        <Button
                          variant="destructive"
                          onClick={() => onCancelBooking(booking.bookingCode)}
                          className="flex-1"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Hủy vé
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
