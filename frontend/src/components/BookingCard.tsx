import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Booking } from '../types';
import { formatCurrency, formatDateTime } from '../utils/formatters';
import { Train, Calendar, MapPin, CreditCard, User, Ticket } from 'lucide-react';

interface BookingCardProps {
  booking: Booking;
  onViewDetails: (booking: Booking) => void;
  onCancel?: (booking: Booking) => void;
}

export function BookingCard({ booking, onViewDetails, onCancel }: BookingCardProps) {
  const { bookingCode, schedule, passengers, totalAmount, status, paymentStatus, createdAt } = booking;

  const statusColors = {
    confirmed: 'bg-green-100 text-green-800 border-green-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200'
  };

  const paymentColors = {
    paid: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    refunded: 'bg-gray-100 text-gray-800'
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Ticket className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-lg">{bookingCode}</h3>
            <Badge className={statusColors[status]}>
              {status === 'confirmed' && 'Đã xác nhận'}
              {status === 'pending' && 'Chờ xử lý'}
              {status === 'cancelled' && 'Đã hủy'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Calendar className="w-4 h-4" />
            <span>Đặt ngày: {formatDateTime(createdAt, '')}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="w-4 h-4" />
            <span>{passengers.length} hành khách</span>
          </div>
        </div>

        <div className="text-right">
          <p className="text-sm text-muted-foreground mb-1">Tổng tiền</p>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalAmount)}</p>
          <Badge className={paymentColors[paymentStatus]} variant="outline">
            {paymentStatus === 'paid' && 'Đã thanh toán'}
            {paymentStatus === 'pending' && 'Chờ thanh toán'}
            {paymentStatus === 'refunded' && 'Đã hoàn tiền'}
          </Badge>
        </div>
      </div>

      <Separator className="my-4" />

      {/* Trip Details */}
      <div className="flex items-center gap-4 mb-4">
        <div className="bg-blue-100 p-2 rounded">
          <Train className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <p className="font-medium">{schedule.train.code} - {schedule.train.name}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{schedule.origin.name}</span>
            </div>
            <span>→</span>
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{schedule.destination.name}</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {formatDateTime(schedule.date, schedule.departureTime)} - {schedule.arrivalTime}
          </p>
        </div>
      </div>

      {/* Seats */}
      <div className="bg-muted/50 rounded p-3 mb-4">
        <p className="text-sm font-medium mb-2">Ghế đã đặt:</p>
        <div className="flex flex-wrap gap-2">
          {booking.seats.map(seat => (
            <Badge key={seat.id} variant="secondary">
              {seat.number}
            </Badge>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => onViewDetails(booking)}
        >
          Xem chi tiết
        </Button>
        {status === 'confirmed' && onCancel && (
          <Button 
            variant="destructive" 
            className="flex-1"
            onClick={() => onCancel(booking)}
          >
            Hủy vé
          </Button>
        )}
      </div>
    </Card>
  );
}
