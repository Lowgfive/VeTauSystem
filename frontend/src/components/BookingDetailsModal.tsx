import { 
  Train, MapPin, Calendar, Clock, User, Ticket, 
  Download, X, CreditCard, CheckCircle, Mail, Phone,
  IdCard, Cake
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Card } from './ui/card';
import { Booking } from '../types';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';

interface BookingDetailsModalProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload?: () => void;
  onCancel?: () => void;
}

export function BookingDetailsModal({
  booking,
  open,
  onOpenChange,
  onDownload,
  onCancel
}: BookingDetailsModalProps) {
  if (!booking) return null;

  const getStatusConfig = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return {
          label: 'Đã xác nhận',
          className: 'bg-success/10 text-success border-success/20',
          icon: CheckCircle
        };
      case 'completed':
        return {
          label: 'Đã hoàn thành',
          className: 'bg-gray-100 text-gray-600 border-gray-200',
          icon: CheckCircle
        };
      case 'cancelled':
        return {
          label: 'Đã hủy',
          className: 'bg-destructive/10 text-destructive border-destructive/20',
          icon: X
        };
      default:
        return {
          label: 'Đang xử lý',
          className: 'bg-warning/10 text-warning border-warning/20',
          icon: Clock
        };
    }
  };

  const statusConfig = getStatusConfig(booking.status);
  const StatusIcon = statusConfig.icon;

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'credit-card':
        return 'Thẻ tín dụng/Ghi nợ';
      case 'bank-transfer':
        return 'Chuyển khoản ngân hàng';
      case 'momo':
        return 'Ví MoMo';
      case 'vnpay':
        return 'VNPay';
      default:
        return method;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="text-2xl">Chi tiết đặt vé</span>
            <Badge className={statusConfig.className}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusConfig.label}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Booking Code Section */}
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Mã đặt vé</p>
              <div className="text-4xl font-bold text-primary tracking-wider font-mono">
                {booking.bookingCode}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Vui lòng xuất trình mã này khi lên tàu
              </p>
            </div>
          </Card>

          {/* Train Information */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Train className="w-5 h-5 text-primary" />
              Thông tin chuyến tàu
            </h3>
            <Card className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Số hiệu tàu</p>
                  <p className="font-semibold text-lg">{booking.trainNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Thời gian hành trình</p>
                  <p className="font-semibold">{booking.duration}</p>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Route Timeline */}
              <div className="grid grid-cols-[1fr,auto,1fr] gap-6 items-center">
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>Ga đi</span>
                  </div>
                  <p className="font-bold text-xl mb-1">{booking.route.origin}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(booking.departureDateTime)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="font-semibold">{booking.departureTime}</span>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                    <Train className="w-6 h-6 text-primary" />
                  </div>
                  <div className="h-1 w-16 bg-gradient-to-r from-primary/20 via-primary to-primary/20 rounded-full"></div>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>Ga đến</span>
                  </div>
                  <p className="font-bold text-xl mb-1">{booking.route.destination}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(booking.arrivalDateTime)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="font-semibold">{booking.arrivalTime}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Seat Information */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-primary" />
              Thông tin ghế
            </h3>
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">Số lượng ghế</span>
                <span className="font-semibold">{booking.seats.length} ghế</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {booking.seats.map((seat) => (
                  <Badge
                    key={seat.id}
                    variant="secondary"
                    className="text-base py-2 px-4 font-mono font-semibold"
                  >
                    {seat.number}
                  </Badge>
                ))}
              </div>
            </Card>
          </div>

          {/* Passenger Information */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Thông tin hành khách
            </h3>
            <div className="space-y-3">
              {booking.passengers.map((passenger, index) => (
                <Card key={passenger.id} className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Hành khách #{index + 1}</p>
                      <p className="font-bold text-lg">{passenger.fullName}</p>
                    </div>
                    <Badge variant="outline" className="font-mono">
                      Ghế {booking.seats[index]?.number}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <IdCard className="w-4 h-4" />
                      <span>CMND/CCCD: {passenger.idNumber}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Cake className="w-4 h-4" />
                      <span>Ngày sinh: {formatDate(passenger.dateOfBirth)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{passenger.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{passenger.email}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Payment Information */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Thông tin thanh toán
            </h3>
            <Card className="p-5">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Phương thức thanh toán</span>
                  <span className="font-semibold">
                    {getPaymentMethodLabel(booking.paymentMethod)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trạng thái thanh toán</span>
                  <Badge 
                    variant={booking.paymentStatus === 'paid' ? 'default' : 'secondary'}
                    className={
                      booking.paymentStatus === 'paid' 
                        ? 'bg-success text-white' 
                        : ''
                    }
                  >
                    {booking.paymentStatus === 'paid' ? 'Đã thanh toán' : 
                     booking.paymentStatus === 'refunded' ? 'Đã hoàn tiền' : 
                     'Chờ thanh toán'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày đặt vé</span>
                  <span className="font-semibold">
                    {formatDateTime(booking.createdAt.split('T')[0], booking.createdAt.split('T')[1]?.slice(0, 5) || '00:00')}
                  </span>
                </div>
                
                <Separator className="my-3" />
                
                <div className="flex justify-between items-center bg-primary/5 p-3 rounded-lg">
                  <span className="font-bold text-lg">Tổng tiền</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(booking.totalAmount)}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {onDownload && (
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={onDownload}
              >
                <Download className="w-4 h-4 mr-2" />
                Tải vé
              </Button>
            )}
            {onCancel && booking.status === 'confirmed' && (
              <Button 
                variant="destructive" 
                className="flex-1"
                onClick={onCancel}
              >
                <X className="w-4 h-4 mr-2" />
                Hủy vé
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
