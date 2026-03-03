import { useState, useMemo } from 'react';
import { 
  Train, MapPin, Clock, Calendar, Users, ChevronRight, 
  Filter, X, Sliders, DollarSign, Armchair, SlidersHorizontal,
  ArrowRight, CheckCircle, Wifi, Zap, BedDouble
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Slider } from './ui/slider';
import { Schedule } from '../types';
import { seatTypes } from '../data/mockData';

interface TrainSearchResultsProps {
  schedules: Schedule[];
  searchParams: {
    originName: string;
    destinationName: string;
    date: string;
  };
  onSelectTrain: (schedule: Schedule) => void;
  onBack: () => void;
}

export function TrainSearchResults({ 
  schedules, 
  searchParams, 
  onSelectTrain,
  onBack 
}: TrainSearchResultsProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  // Filter states
  const [selectedTimeRanges, setSelectedTimeRanges] = useState<string[]>([]);
  const [selectedSeatClasses, setSelectedSeatClasses] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 3000000]);

  // Calculate price range from schedules
  const { minPrice, maxPrice } = useMemo(() => {
    if (schedules.length === 0) return { minPrice: 0, maxPrice: 3000000 };
    const prices = schedules.map(s => s.basePrice);
    return {
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices) * 2.5 // Account for seat type multipliers
    };
  }, [schedules]);

  // Time ranges
  const timeRanges = [
    { id: 'morning', label: 'Sáng sớm (00:00 - 06:00)', start: 0, end: 6 },
    { id: 'early-morning', label: 'Buổi sáng (06:00 - 12:00)', start: 6, end: 12 },
    { id: 'afternoon', label: 'Buổi chiều (12:00 - 18:00)', start: 12, end: 18 },
    { id: 'evening', label: 'Buổi tối (18:00 - 24:00)', start: 18, end: 24 }
  ];

  // Filter schedules
  const filteredSchedules = useMemo(() => {
    return schedules.filter(schedule => {
      // Time filter
      if (selectedTimeRanges.length > 0) {
        const hour = parseInt(schedule.departureTime.split(':')[0]);
        const matchesTime = selectedTimeRanges.some(rangeId => {
          const range = timeRanges.find(r => r.id === rangeId);
          return range && hour >= range.start && hour < range.end;
        });
        if (!matchesTime) return false;
      }

      // Seat class filter
      if (selectedSeatClasses.length > 0) {
        const hasMatchingSeat = schedule.train.carriages.some(carriage =>
          selectedSeatClasses.includes(carriage.type)
        );
        if (!hasMatchingSeat) return false;
      }

      // Price filter
      const lowestPrice = schedule.basePrice;
      const highestPrice = schedule.basePrice * 2.5;
      if (highestPrice < priceRange[0] || lowestPrice > priceRange[1]) {
        return false;
      }

      return true;
    });
  }, [schedules, selectedTimeRanges, selectedSeatClasses, priceRange, timeRanges]);

  const toggleTimeRange = (rangeId: string) => {
    setSelectedTimeRanges(prev =>
      prev.includes(rangeId)
        ? prev.filter(id => id !== rangeId)
        : [...prev, rangeId]
    );
  };

  const toggleSeatClass = (classId: string) => {
    setSelectedSeatClasses(prev =>
      prev.includes(classId)
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  const clearAllFilters = () => {
    setSelectedTimeRanges([]);
    setSelectedSeatClasses([]);
    setPriceRange([minPrice, maxPrice]);
  };

  const activeFilterCount = 
    selectedTimeRanges.length + 
    selectedSeatClasses.length + 
    (priceRange[0] !== minPrice || priceRange[1] !== maxPrice ? 1 : 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Filters Sidebar Component
  const FiltersSidebar = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-lg">Bộ lọc</h3>
        </div>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-xs text-gray-600 hover:text-primary"
          >
            Xóa tất cả
          </Button>
        )}
      </div>

      <Separator />

      {/* Departure Time Filter */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 font-semibold text-gray-900">
          <Clock className="w-4 h-4 text-primary" />
          Giờ khởi hành
        </Label>
        <div className="space-y-2">
          {timeRanges.map(range => (
            <div key={range.id} className="flex items-center gap-2">
              <Checkbox
                id={range.id}
                checked={selectedTimeRanges.includes(range.id)}
                onCheckedChange={() => toggleTimeRange(range.id)}
              />
              <Label
                htmlFor={range.id}
                className="text-sm text-gray-700 cursor-pointer flex-1"
              >
                {range.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Seat Class Filter */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 font-semibold text-gray-900">
          <Armchair className="w-4 h-4 text-primary" />
          Loại ghế
        </Label>
        <div className="space-y-2">
          {seatTypes.map(seatType => (
            <div key={seatType.id} className="flex items-center gap-2">
              <Checkbox
                id={`seat-${seatType.id}`}
                checked={selectedSeatClasses.includes(seatType.id)}
                onCheckedChange={() => toggleSeatClass(seatType.id)}
              />
              <Label
                htmlFor={`seat-${seatType.id}`}
                className="text-sm text-gray-700 cursor-pointer flex-1"
              >
                {seatType.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range Filter */}
      <div className="space-y-4">
        <Label className="flex items-center gap-2 font-semibold text-gray-900">
          <DollarSign className="w-4 h-4 text-primary" />
          Khoảng giá
        </Label>
        <div className="px-2">
          <Slider
            min={minPrice}
            max={maxPrice}
            step={50000}
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            className="w-full"
          />
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {formatPrice(priceRange[0])}
          </span>
          <span className="text-gray-600">
            {formatPrice(priceRange[1])}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-gray-600 hover:text-primary"
            >
              ← Quay lại
            </Button>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="font-bold text-lg">{searchParams.originName}</span>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-secondary" />
                <span className="font-bold text-lg">{searchParams.destinationName}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">{formatDate(searchParams.date)}</span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                className="md:hidden"
              >
                <Filter className="w-4 h-4 mr-2" />
                Lọc
                {activeFilterCount > 0 && (
                  <Badge className="ml-2 bg-primary text-white">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block">
            <Card className="p-6 sticky top-24">
              <FiltersSidebar />
            </Card>
          </aside>

          {/* Mobile Filters Modal */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
              <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg">Bộ lọc</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setMobileFiltersOpen(false)}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                  <FiltersSidebar />
                  <div className="mt-6 pt-6 border-t">
                    <Button
                      className="w-full bg-primary hover:bg-primary-hover"
                      onClick={() => setMobileFiltersOpen(false)}
                    >
                      Áp dụng ({filteredSchedules.length} kết quả)
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          <main className="space-y-4">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Tìm thấy {filteredSchedules.length} chuyến tàu
              </h2>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="hidden md:flex">
                  {activeFilterCount} bộ lọc đang áp dụng
                </Badge>
              )}
            </div>

            {/* Train Cards */}
            {filteredSchedules.length === 0 ? (
              <Card className="p-12 text-center">
                <Train className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Không tìm thấy chuyến tàu
                </h3>
                <p className="text-gray-600 mb-4">
                  Vui lòng thử điều chỉnh bộ lọc hoặc tìm kiếm lại
                </p>
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  disabled={activeFilterCount === 0}
                >
                  Xóa bộ lọc
                </Button>
              </Card>
            ) : (
              filteredSchedules.map((schedule) => {
                const lowestPrice = schedule.basePrice;
                const availableSeatTypes = Array.from(
                  new Set(schedule.train.carriages.map(c => c.type))
                );

                return (
                  <Card
                    key={schedule.id}
                    className="p-6 hover:shadow-railway-lg transition-all border-2 hover:border-primary/20"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto] gap-6">
                      {/* Train Info */}
                      <div className="space-y-4">
                        {/* Train Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-primary/10 rounded-xl">
                              <Train className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-lg text-gray-900">
                                  {schedule.train.code}
                                </h3>
                                <Badge variant="secondary" className="text-xs">
                                  {schedule.train.name}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">
                                {schedule.duration}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Route and Time */}
                        <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
                          {/* Departure */}
                          <div>
                            <div className="text-3xl font-bold text-gray-900 mb-1">
                              {schedule.departureTime}
                            </div>
                            <div className="text-sm text-gray-600">
                              {schedule.origin.name}
                            </div>
                          </div>

                          {/* Duration */}
                          <div className="flex flex-col items-center px-4">
                            <div className="flex items-center gap-2 text-gray-400 mb-1">
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                              <div className="h-px w-16 bg-gray-300"></div>
                              <ArrowRight className="w-4 h-4" />
                              <div className="h-px w-16 bg-gray-300"></div>
                              <div className="w-2 h-2 bg-secondary rounded-full"></div>
                            </div>
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {schedule.duration}
                            </span>
                          </div>

                          {/* Arrival */}
                          <div className="text-right">
                            <div className="text-3xl font-bold text-gray-900 mb-1">
                              {schedule.arrivalTime}
                            </div>
                            <div className="text-sm text-gray-600">
                              {schedule.destination.name}
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Additional Info */}
                        <div className="flex flex-wrap gap-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              Còn <strong className="text-primary">{schedule.availableSeats}</strong> chỗ
                            </span>
                          </div>
                          
                          {/* Amenities */}
                          {schedule.train.amenities.slice(0, 3).map((amenity, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {amenity === 'Wifi' && <Wifi className="w-3 h-3 mr-1" />}
                              {amenity}
                            </Badge>
                          ))}
                        </div>

                        {/* Available Seat Types */}
                        <div className="flex flex-wrap gap-2">
                          <span className="text-sm text-gray-600">Loại ghế:</span>
                          {availableSeatTypes.map(seatTypeId => {
                            const seatType = seatTypes.find(st => st.id === seatTypeId);
                            return seatType ? (
                              <Badge
                                key={seatTypeId}
                                className="bg-primary/10 text-primary border-primary/20 text-xs"
                              >
                                {seatType.name}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>

                      {/* Price and Action */}
                      <div className="flex flex-col justify-between items-end gap-4 min-w-[200px]">
                        <div className="text-right">
                          <p className="text-sm text-gray-600 mb-1">Giá từ</p>
                          <div className="text-3xl font-bold text-primary mb-1">
                            {formatPrice(lowestPrice)}
                          </div>
                          <p className="text-xs text-gray-500">
                            (Chưa bao gồm loại ghế)
                          </p>
                        </div>

                        <Button
                          size="lg"
                          onClick={() => onSelectTrain(schedule)}
                          className="w-full bg-primary hover:bg-primary-hover text-white font-semibold shadow-lg hover:shadow-xl transition-all group"
                        >
                          Chọn chuyến
                          <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
