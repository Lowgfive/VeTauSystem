import { Train, ArrowRight, Clock, Armchair } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Schedule } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface TrainCardProps {
  schedule: Schedule;
  onSelect: (schedule: Schedule) => void;
}

export function TrainCard({ schedule, onSelect }: TrainCardProps) {
  const { train, origin, destination, departureTime, arrivalTime, date, basePrice, availableSeats, duration, status } = schedule;

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Train Info */}
        <div className="flex items-start gap-4 flex-1">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Train className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">{train.code}</h3>
              <Badge variant="secondary">{train.name}</Badge>
              {status === 'on-time' && <Badge variant="outline" className="text-green-600">Đúng giờ</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">{formatDate(date)}</p>
          </div>
        </div>

        {/* Route & Time */}
        <div className="flex items-center gap-4 flex-1 justify-center">
          <div className="text-right">
            <p className="font-semibold text-lg">{departureTime}</p>
            <p className="text-sm text-muted-foreground">{origin.name}</p>
          </div>
          
          <div className="flex flex-col items-center gap-1 min-w-[100px]">
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{duration}</span>
            </div>
          </div>
          
          <div className="text-left">
            <p className="font-semibold text-lg">{arrivalTime}</p>
            <p className="text-sm text-muted-foreground">{destination.name}</p>
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex flex-col items-end gap-3 min-w-[200px]">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Giá từ</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(basePrice)}</p>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Armchair className="w-4 h-4" />
            <span>Còn {availableSeats} chỗ</span>
          </div>
          
          <Button 
            onClick={() => onSelect(schedule)} 
            className="w-full"
            disabled={availableSeats === 0}
          >
            {availableSeats > 0 ? 'Chọn chuyến' : 'Hết chỗ'}
          </Button>
        </div>
      </div>

      {/* Amenities */}
      {train.amenities && train.amenities.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex flex-wrap gap-2">
            {train.amenities.map((amenity, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {amenity}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
