import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Carriage, Seat, SeatType } from '../types';
import { cn } from './ui/utils';

interface SeatMapProps {
  carriages: Carriage[];
  seatsData: Record<string, Seat[]>; // Nhận từ API
  selectedSeats?: Seat[];
  onSeatSelect?: (seat: Seat) => void;
  maxSeats?: number;
  readOnly?: boolean;
}

export function SeatMap({
  carriages,
  seatsData,
  selectedSeats = [],
  onSeatSelect,
  maxSeats = 8,
  readOnly = false
}: SeatMapProps) {
  const [activeCarriage, setActiveCarriage] = useState(carriages[0]?._id?.toString() || '');

  useEffect(() => {
    if (carriages.length > 0 && !activeCarriage) {
      setActiveCarriage(carriages[0]._id.toString());
    }
  }, [carriages, activeCarriage]);

  const currentCarriage = carriages.find(c => c._id.toString() === activeCarriage);
  const currentSeats = seatsData[activeCarriage] || [];

  const handleSeatClick = (seat: Seat) => {
    if (readOnly || !onSeatSelect || seat.status === 'booked' || seat.status === 'locked' || seat.seat_type === 'standing') return;

    const isSelected = selectedSeats.some(s => s._id === seat._id);

    if (isSelected) {
      onSeatSelect(seat); // Deselect
    } else if (selectedSeats.length < maxSeats) {
      onSeatSelect(seat);
    }
  };

  const getSeatTypeName = (type: string) => {
    if (type === 'seat') return 'Ghế ngồi';
    if (type === 'priority') return 'Ghế ưu tiên';
    if (type === 'standing') return 'Chỗ đứng';
    return type;
  };

  const renderSeat = (seat: Seat) => {
    const isSelected = selectedSeats.some(s => s._id === seat._id);
    const status = isSelected ? 'selected' : seat.status;

    let colorClasses = '';

    if (status === 'selected') {
      colorClasses = 'bg-blue-600 text-white border-2 border-blue-700';
    } else if (status === 'booked' || status === 'locked') {
      colorClasses = 'bg-gray-200 text-gray-400 cursor-not-allowed';
    } else {
      // available
      if (seat.seat_type === 'priority') {
        colorClasses = 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border border-yellow-300 shadow-sm';
      } else if (seat.seat_type === 'seat') {
        colorClasses = 'bg-white text-gray-800 hover:bg-gray-50 border border-gray-300 shadow-sm';
      } else {
        // standing
        colorClasses = 'bg-transparent text-gray-400 border border-dashed border-gray-200 cursor-default opacity-50';
      }
    }

    return (
      <button
        key={seat._id}
        onClick={() => handleSeatClick(seat)}
        disabled={readOnly || seat.status === 'booked' || seat.status === 'locked' || seat.seat_type === 'standing'}
        className={cn(
          'w-10 h-10 rounded text-xs font-medium transition-all',
          'flex items-center justify-center',
          colorClasses,
          readOnly && seat.seat_type !== 'standing' && 'cursor-default hover:bg-inherit hover:border-inherit'
        )}
        title={`Ghế ${seat.seat_number} - ${status === 'booked' ? 'Đã đặt/Khóa' : status === 'selected' ? 'Đã chọn' : getSeatTypeName(seat.seat_type)}`}
      >
        {seat.seat_type === 'standing' ? '' : seat.seat_number.slice(-2)}
      </button>
    );
  };

  if (!currentCarriage || carriages.length === 0) return (
    <div className="p-8 text-center text-muted-foreground border-dashed border rounded-lg">
      Không có dữ liệu sơ đồ ghế.
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Carriage Selector */}
      <Tabs value={activeCarriage} onValueChange={setActiveCarriage}>
        <TabsList className="grid grid-cols-4 lg:grid-cols-6 xl:grid-cols-10 gap-2 h-auto p-2 bg-muted/50">
          {carriages.map((carriage) => (
            <TabsTrigger
              key={carriage._id.toString()}
              value={carriage._id.toString()}
              className="flex flex-col items-center gap-1 px-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow"
            >
              <span className="font-semibold">Toa {carriage.carriage_number}</span>
              <span className="text-xs text-muted-foreground">Khoang hành khách</span>
              <Badge variant="secondary" className="text-xs">
                {carriage.total_seats} chỗ
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {carriages.map(carriage => {
          // Tự động suy ra số lưới cols dựa trên loại tàu (thường là 4 hoặc cấu trúc 2-cửa-2)
          return (
            <TabsContent key={carriage._id.toString()} value={carriage._id.toString()} className="mt-4">
              <Card className="p-6">
                <div className="mb-4">
                  <h3 className="font-semibold mb-1">Toa {carriage.carriage_number}</h3>
                  <p className="text-sm text-muted-foreground">Sơ đồ có các khu vực ghế ưu tiên ở hai đầu. Lối đi nằm ở giữa.</p>
                </div>

                {/* Seat Grid */}
                <div className="relative">
                  {/* Aisle indicator for train layout */}
                  <div className="flex justify-center mb-4">
                    <div className="text-xs text-muted-foreground bg-muted px-4 py-1 rounded-full">
                      ← Đầu toa | Cuối toa →
                    </div>
                  </div>

                  <div
                    className="grid gap-2 mx-auto max-w-fit"
                    style={{
                      // Default block is usually 4/6 blocks layout. Hardcoded 4 for UI
                      gridTemplateColumns: `repeat(4, minmax(0, 1fr))`
                    }}
                  >
                    {currentSeats.map(seat => renderSeat(seat))}
                  </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-white border border-gray-300 rounded shadow-sm"></div>
                    <span className="text-sm">Ghế trống</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded shadow-sm"></div>
                    <span className="text-sm">Ghế ưu tiên</span>
                  </div>
                  {!readOnly && (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-600 border-2 border-blue-700 rounded"></div>
                      <span className="text-sm">Đã chọn</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    <span className="text-sm">Đã đặt / Đã khóa</span>
                  </div>
                </div>
              </Card>
            </TabsContent>
          )
        })}
      </Tabs>

      {/* Selected Seats Summary */}
      {selectedSeats.length > 0 && !readOnly && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-blue-900">Ghế đã chọn:</p>
              <p className="text-sm text-blue-700 mt-1">
                {selectedSeats.map(s => s.seat_number).join(', ')}
              </p>
            </div>
            <Badge className="bg-blue-600">
              {selectedSeats.length}/{maxSeats} ghế
            </Badge>
          </div>
        </Card>
      )}
    </div>
  );
}
