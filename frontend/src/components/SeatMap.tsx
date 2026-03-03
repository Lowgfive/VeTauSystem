import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Carriage, Seat, SeatType } from '../types';
import { generateSeatsForCarriage, seatTypes } from '../data/mockData';
import { cn } from './ui/utils';

interface SeatMapProps {
  carriages: Carriage[];
  selectedSeats: Seat[];
  onSeatSelect: (seat: Seat) => void;
  maxSeats?: number;
}

export function SeatMap({ carriages, selectedSeats, onSeatSelect, maxSeats = 8 }: SeatMapProps) {
  const [activeCarriage, setActiveCarriage] = useState(carriages[0]?.id || '');
  const [seatsData, setSeatsData] = useState<{ [carriageId: string]: Seat[] }>({});

  useEffect(() => {
    // Generate seats for all carriages
    const allSeats: { [carriageId: string]: Seat[] } = {};
    carriages.forEach(carriage => {
      allSeats[carriage.id] = generateSeatsForCarriage(carriage);
    });
    setSeatsData(allSeats);
  }, [carriages]);

  const currentCarriage = carriages.find(c => c.id === activeCarriage);
  const currentSeats = seatsData[activeCarriage] || [];

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'booked') return;
    
    const isSelected = selectedSeats.some(s => s.id === seat.id);
    
    if (isSelected) {
      onSeatSelect(seat);
    } else if (selectedSeats.length < maxSeats) {
      onSeatSelect(seat);
    }
  };

  const getSeatInfo = (type: SeatType) => {
    return seatTypes.find(st => st.id === type);
  };

  const renderSeat = (seat: Seat) => {
    const isSelected = selectedSeats.some(s => s.id === seat.id);
    const status = isSelected ? 'selected' : seat.status;

    return (
      <button
        key={seat.id}
        onClick={() => handleSeatClick(seat)}
        disabled={seat.status === 'booked'}
        className={cn(
          'w-10 h-10 rounded text-xs font-medium transition-all',
          'flex items-center justify-center',
          status === 'available' && 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300',
          status === 'selected' && 'bg-blue-600 text-white border-2 border-blue-700',
          status === 'booked' && 'bg-gray-200 text-gray-400 cursor-not-allowed'
        )}
        title={`Ghế ${seat.number} - ${status === 'booked' ? 'Đã đặt' : status === 'selected' ? 'Đã chọn' : 'Còn trống'}`}
      >
        {seat.number.slice(-2)}
      </button>
    );
  };

  if (!currentCarriage) return null;

  return (
    <div className="space-y-4">
      {/* Carriage Selector */}
      <Tabs value={activeCarriage} onValueChange={setActiveCarriage}>
        <TabsList className="grid grid-cols-4 lg:grid-cols-6 xl:grid-cols-10 gap-2 h-auto p-2 bg-muted/50">
          {carriages.map(carriage => {
            const seatInfo = getSeatInfo(carriage.type);
            return (
              <TabsTrigger
                key={carriage.id}
                value={carriage.id}
                className="flex flex-col items-center gap-1 px-2 py-3 data-[state=active]:bg-white data-[state=active]:shadow"
              >
                <span className="font-semibold">Toa {carriage.number}</span>
                <span className="text-xs text-muted-foreground">{seatInfo?.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {carriage.availableSeats}/{carriage.totalSeats}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {carriages.map(carriage => (
          <TabsContent key={carriage.id} value={carriage.id} className="mt-4">
            <Card className="p-6">
              <div className="mb-4">
                <h3 className="font-semibold mb-1">Toa {carriage.number} - {getSeatInfo(carriage.type)?.name}</h3>
                <p className="text-sm text-muted-foreground">{getSeatInfo(carriage.type)?.description}</p>
              </div>

              {/* Seat Grid */}
              <div className="relative">
                {/* Aisle indicator for train layout */}
                <div className="flex justify-center mb-4">
                  <div className="text-xs text-muted-foreground bg-muted px-4 py-1 rounded-full">
                    ← Đầu tàu | Cuối tàu →
                  </div>
                </div>

                <div 
                  className="grid gap-2 mx-auto max-w-fit"
                  style={{
                    gridTemplateColumns: `repeat(${carriage.layout.cols}, minmax(0, 1fr))`
                  }}
                >
                  {currentSeats.map(seat => renderSeat(seat))}
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                  <span className="text-sm">Còn trống</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-600 border-2 border-blue-700 rounded"></div>
                  <span className="text-sm">Đã chọn</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <span className="text-sm">Đã đặt</span>
                </div>
              </div>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Selected Seats Summary */}
      {selectedSeats.length > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-blue-900">Ghế đã chọn:</p>
              <p className="text-sm text-blue-700 mt-1">
                {selectedSeats.map(s => s.number).join(', ')}
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
