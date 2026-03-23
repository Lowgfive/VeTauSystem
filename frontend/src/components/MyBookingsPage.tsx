import { useState, useMemo } from 'react';
import {
  Train, ArrowLeft, Search, Filter, Calendar, MapPin,
  Clock, Ticket, ChevronRight, Download, X, AlertCircle,
  CheckCircle, XCircle, Package, Hash
} from 'lucide-react';
import { toast } from 'sonner';
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
  onCancelBooking: (bookingCode: string) => void;
  onChangeTicket: (booking: Booking) => void;
  onDownload?: (bookingCode: string) => void;
}

export function MyBookingsPage({
  bookings,
  onBack,
  onViewDetails,
  onCancelBooking,
  onChangeTicket,
  onDownload
}: MyBookingsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'cancelled' | 'completed'>('all');

  // Filter bookings
  const filteredBookings = useMemo(() => {
    let filtered = bookings;

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'confirmed') {
        filtered = filtered.filter(b => ['confirmed', 'paid', 'pending', 'reserved'].includes(b.status));
      } else if (statusFilter === 'cancelled') {
        filtered = filtered.filter(b => b.status === 'cancelled' || b.status === 'refunded');
      } else {
        filtered = filtered.filter(b => b.status === statusFilter);
      }
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
      confirmed: bookings.filter(b => ['confirmed', 'paid', 'pending', 'reserved'].includes(b.status)).length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled' || b.status === 'refunded').length,
    };
  }, [bookings]);

  const getStatusConfig = (status: Booking['status']) => {
    switch (status) {
      case 'paid':
      case 'confirmed':
        return {
          icon: CheckCircle,
          label: status === 'paid' ? 'Đã thanh toán' : 'Đã xác nhận',
          className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
          iconClassName: 'text-emerald-600'
        };
      case 'completed':
        return {
          icon: CheckCircle,
          label: 'Đã hoàn thành',
          className: 'bg-blue-100 text-blue-700 border-blue-200',
          iconClassName: 'text-blue-600'
        };
      case 'cancelled':
        return {
          icon: XCircle,
          label: 'Đã hủy',
          className: 'bg-rose-100 text-rose-700 border-rose-200',
          iconClassName: 'text-rose-600'
        };
      case 'refunded':
        return {
          icon: ArrowLeft,
          label: 'Đã hoàn tiền',
          className: 'bg-amber-100 text-amber-700 border-amber-200',
          iconClassName: 'text-amber-600'
        };
      default:
        return {
          icon: AlertCircle,
          label: 'Đang xử lý',
          className: 'bg-slate-100 text-slate-700 border-slate-200',
          iconClassName: 'text-slate-600'
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
            <Tabs value={statusFilter} onValueChange={(v: string) => setStatusFilter(v as any)} className="w-full">
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
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-lg group relative"
                >
                  {/* Perforated edge effect */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 group-hover:bg-primary transition-colors" />
                  <div className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-4 h-4 bg-slate-50 rounded-full shadow-inner z-10" />
                  <div className="absolute right-[-8px] top-1/2 -translate-y-1/2 w-4 h-4 bg-slate-50 rounded-full shadow-inner z-10" />

                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Train className="w-5 h-5 text-primary" />
                          <span className="font-bold text-lg text-slate-800">{booking.trainNumber}</span>
                          <Badge variant="outline" className="font-mono bg-slate-50">
                            {booking.bookingCode}
                          </Badge>
                        </div>
                        <Badge className={`${statusConfig.className} shadow-sm border`}>
                          <StatusIcon className={`w-3 h-3 mr-1 ${statusConfig.iconClassName}`} />
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-primary tracking-tight">
                          {formatCurrency(booking.totalAmount)}
                        </div>
                        <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                          {booking.seats.length} Hành khách
                        </div>
                      </div>
                    </div>

                    {/* Route */}
                    <div className="grid grid-cols-[1fr,auto,1fr] gap-6 items-center mb-6 py-4 border-y border-dashed border-slate-200">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Khởi hành</span>
                        <div className="font-bold text-xl text-slate-800">{booking.route.origin}</div>
                        <div className="flex items-center gap-1.5 text-slate-600 text-sm mt-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDate(booking.departureDateTime)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-primary text-base font-bold">
                          <Clock className="w-4 h-4" />
                          <span>{booking.departureTime}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-center justify-center">
                        <div className="w-12 h-[2px] bg-slate-200 relative">
                        </div>
                        <Badge variant="outline" className="text-[10px] py-0 mt-2 bg-white text-slate-500">
                          {booking.duration || "N/A"}
                        </Badge>
                      </div>

                      <div className="flex flex-col text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Điểm đến</span>
                        <div className="font-bold text-xl text-slate-800">{booking.route.destination}</div>
                        <div className="flex justify-end items-center gap-1.5 text-slate-600 text-sm mt-1">
                          <span>{formatDate(booking.arrivalDateTime)}</span>
                          <Calendar className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex justify-end items-center gap-1.5 text-slate-500 text-base font-medium">
                          <span>{booking.arrivalTime}</span>
                          <Clock className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* Seats & Quick Info */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex flex-wrap gap-2">
                        {booking.seats.map((seat) => (
                          <div key={seat._id} className="flex flex-col items-center bg-primary/5 border border-primary/10 rounded-md px-3 py-1">
                            <span className="text-[9px] font-bold text-primary/60 uppercase">Ghế</span>
                            <span className="text-sm font-mono font-bold text-primary">{seat.seat_number}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Package className="w-4 h-4" />
                        <span className="text-xs font-medium">Standard Class</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3">
                      <Button
                        variant="default"
                        onClick={() => onViewDetails(booking)}
                        className="flex-1 min-w-[120px] h-11 bg-primary hover:bg-primary/90 shadow-md transition-all active:scale-95 text-xs font-bold uppercase tracking-wider"
                      >
                        <Ticket className="w-4 h-4 mr-2" />
                        Chi tiết vé
                      </Button>
                      
                      {['paid', 'confirmed', 'pending', 'reserved'].includes(booking.status) && (
                        <Button
                          variant="outline"
                          onClick={() => onCancelBooking(booking.bookingCode)}
                          className="flex-1 min-w-[120px] h-11 border-2 border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 shadow-sm transition-all active:scale-95 text-xs font-bold uppercase tracking-wider"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Hủy vé
                        </Button>
                      )}

                      {['paid', 'confirmed'].includes(booking.status) && (
                        <Button
                          variant="outline"
                          className="flex-1 min-w-[120px] h-11 border-2 border-blue-100 text-blue-600 hover:bg-blue-50 hover:border-blue-200 shadow-sm transition-all active:scale-95 text-xs font-bold uppercase tracking-wider"
                          onClick={() => onChangeTicket(booking)}
                        >
                          <Hash className="w-4 h-4 mr-2" />
                          Đổi vé
                        </Button>
                      )}

                      <Button
                        variant="secondary"
                        className="flex-1 min-w-[120px] h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all active:scale-95 text-sm font-bold"
                        onClick={() => onDownload && onDownload(booking.bookingCode)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        PDF
                      </Button>
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
