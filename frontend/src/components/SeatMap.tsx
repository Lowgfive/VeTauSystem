import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Carriage, Seat } from '../types';
import { cn } from './ui/utils';
import { Armchair, BedDouble, Info, CheckCircle2, Lock, ArrowUp, ArrowDown } from 'lucide-react';

interface SeatMapProps {
  carriages: Carriage[];
  seatsData: Record<string, Seat[]>;
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
  const [activeCarriage, setActiveCarriage] = useState<string>(String(carriages[0]?._id || ''));

  useEffect(() => {
    if (carriages.length > 0 && !activeCarriage) {
      setActiveCarriage(String(carriages[0]._id));
    }
  }, [carriages, activeCarriage]);

  const currentCarriage = carriages.find(c => String(c._id) === activeCarriage);
  const currentSeats = seatsData[activeCarriage] || [];

  const handleSeatClick = (seat: Seat) => {
    if (readOnly || !onSeatSelect || seat.status === 'booked' || seat.status === 'locked') return;

    const isSelected = selectedSeats.some(s => s._id === seat._id);

    if (isSelected) {
      onSeatSelect(seat);
    } else if (selectedSeats.length < maxSeats) {
      onSeatSelect(seat);
    }
  };

  const getSeatTypeName = (type: string) => {
    if (type === 'hard_seat') return 'Ghế cứng';
    if (type === 'soft_seat') return 'Ghế mềm';
    if (type === 'sleeper_6') return 'Giường nằm khoang 6';
    if (type === 'sleeper_4') return 'Giường nằm khoang 4';
    if (type === 'vip_sleeper_2') return 'Giường VIP khoang 2';
    return type;
  };

  const renderSeat = (seat: Seat) => {
    const isSelected = selectedSeats.some(s => s._id === seat._id);
    const status = isSelected ? 'selected' : seat.status;

    let baseStyle = "relative flex flex-col items-center justify-center w-12 h-14 sm:w-14 sm:h-16 rounded-xl text-sm font-bold transition-all duration-300 shadow-sm border-2 group overflow-hidden select-none outline-none focus:outline-none";
    let colorClasses = "";
    const isSleeper = ['sleeper_6', 'sleeper_4', 'vip_sleeper_2'].includes(seat.seat_type);
    let Icon = isSleeper ? BedDouble : Armchair;

    if (status === 'selected') {
      colorClasses = 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/30 transform scale-110 z-10';
    } else if (status === 'booked' || status === 'locked') {
      colorClasses = 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60';
    } else {
      if (isSleeper) {
        colorClasses = 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 hover:border-amber-400 hover:shadow-md cursor-pointer hover:-translate-y-1';
      } else {
        colorClasses = 'bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md cursor-pointer hover:-translate-y-1';
      }
    }

    return (
      <button
        key={seat._id}
        onClick={() => handleSeatClick(seat)}
        disabled={readOnly || status === 'booked' || status === 'locked'}
        className={cn(baseStyle, colorClasses, readOnly && 'cursor-default hover:transform-none')}
        title={`Ghế ${seat.seat_number} - ${status === 'booked' ? 'Đã đặt/Khóa' : status === 'selected' ? 'Đã chọn' : getSeatTypeName(seat.seat_type)}`}
      >
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br from-white/40 to-transparent",
          status === 'selected' ? 'opacity-20' : 'opacity-60'
        )} />
        <span className={cn(
          "absolute top-1 sm:top-1.5 transition-opacity duration-300",
          status === 'selected' ? 'opacity-30' : 'opacity-20 group-hover:opacity-40'
        )}>
          <Icon size={isSleeper ? 24 : 20} strokeWidth={2.5} />
        </span>
        <span className="relative z-10 mt-3 sm:mt-4 text-sm sm:text-base">{seat.seat_number.slice(-2)}</span>

        {status === 'selected' && (
          <div className="absolute -top-1 -right-1 bg-white rounded-full text-blue-600 shadow-sm border">
            <CheckCircle2 size={14} className="fill-blue-600 text-white" />
          </div>
        )}
        {(status === 'booked' || status === 'locked') && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-400 opacity-50">
            <Lock size={20} />
          </div>
        )}
      </button>
    );
  };

  if (!currentCarriage || carriages.length === 0) return (
    <div className="p-12 flex flex-col items-center justify-center text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
      <Armchair className="w-12 h-12 text-slate-300 mb-4" />
      <h3 className="text-lg font-medium text-slate-600">Không có dữ liệu sơ đồ ghế</h3>
      <p className="text-slate-400 text-sm mt-1">Vui lòng chọn chuyến tàu và ngày đi khác.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <Tabs value={activeCarriage} onValueChange={setActiveCarriage} className="w-full">
        <div className="relative">
          <TabsList className="flex h-auto w-full gap-3 p-2 bg-slate-100/80 backdrop-blur-sm rounded-2xl overflow-x-auto snap-x hide-scrollbar justify-start sm:justify-center items-center shadow-inner border border-slate-200/60">
            {carriages.map((carriage) => (
              <TabsTrigger
                key={String(carriage._id)}
                value={String(carriage._id)}
                onClick={() => setActiveCarriage(String(carriage._id))}
                style={{
                  color: activeCarriage === String(carriage._id) ? "#ffffff" : "inherit"
                }}
                className={cn(
                  "flex flex-col items-center gap-1.5 px-5 py-3 rounded-xl min-w-[120px] transition-all duration-300 shadow-sm cursor-pointer snap-center shrink-0 group relative overflow-hidden flex-shrink-0",
                  activeCarriage === String(carriage._id)
                    ? "bg-blue-600 !text-white border-blue-700 shadow-lg scale-105 border"
                    : "bg-white text-slate-600 border border-slate-200/60 hover:bg-slate-50 border"
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-[.bg-blue-600]:opacity-100 pointer-events-none"></div>
                <span className="font-bold text-base sm:text-lg tracking-tight z-10">Toa {carriage.carriage_number}</span>
                <Badge variant="outline" className={cn(
                  "text-[10px] sm:text-xs z-10 transition-colors border-0 mt-0",
                  activeCarriage === String(carriage._id)
                    ? "bg-blue-700/50 !text-white"
                    : "bg-slate-100 text-slate-600"
                )}>
                  {carriage.total_seats} chỗ
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {carriages.map(carriage => (
          <TabsContent key={String(carriage._id)} value={String(carriage._id)} className="mt-8 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
            <Card className="overflow-hidden border-0 shadow-xl bg-white rounded-3xl ring-1 ring-slate-100">
              <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                  <div>
                    <h3 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 mb-2">
                      Toa {carriage.carriage_number}
                    </h3>
                    <div className="flex items-center text-sm text-slate-500">
                      <Info className="w-4 h-4 mr-2 text-slate-400" />
                      Sơ đồ có các khu vực ghế ưu tiên ở hai đầu. Lối đi nằm ở giữa.
                    </div>
                  </div>

                  {selectedSeats.length > 0 && !readOnly && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 px-5 flex items-center gap-4 shadow-sm w-full xl:w-auto overflow-x-auto">
                      <div className="shrink-0">
                        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Đang chọn</p>
                        <p className="text-lg font-bold text-blue-900 leading-tight">
                          {selectedSeats.length} <span className="text-sm font-medium text-blue-700">/ {maxSeats}</span>
                        </p>
                      </div>
                      <div className="h-8 w-px bg-blue-200 shrink-0"></div>
                      <div className="text-sm font-bold text-blue-800 break-words flex gap-2 w-max">
                        {selectedSeats.map(s => (
                          <span key={s._id} className="bg-white px-2.5 py-1 rounded shadow-sm border border-blue-100">{s.seat_number}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 sm:p-12 bg-slate-50 border-b border-t border-slate-100 overflow-x-auto flex justify-center w-full">
                <div className="relative py-10 px-8 sm:px-14 bg-white rounded-[2rem] sm:rounded-[4rem] border-8 border-slate-200 shadow-sm w-fit mx-auto min-w-max">

                  {/* Decorative train cab curve top */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-200 rounded-b-3xl"></div>

                  <div className="flex justify-center mb-12 relative z-10">
                    <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-xs px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
                      <ArrowUp size={16} className="text-slate-300" />
                      Đầu Toa
                    </div>
                  </div>

                  <div className="flex gap-8 sm:gap-16 justify-center relative z-10">
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 place-items-center">
                      {currentSeats.filter((_, i) => i % 4 < 2).map(renderSeat)}
                    </div>

                    <div className="flex flex-col items-center justify-center opacity-40 shrink-0">
                      <div className="h-full border-l-2 border-slate-400 border-dashed"></div>
                      <div className="py-8 font-black text-slate-400 tracking-[0.4em] text-sm uppercase translate-x-[2px]" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>LỐI ĐI</div>
                      <div className="h-full border-l-2 border-slate-400 border-dashed"></div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4 place-items-center">
                      {currentSeats.filter((_, i) => i % 4 >= 2).map(renderSeat)}
                    </div>
                  </div>

                  <div className="flex justify-center mt-12 relative z-10">
                    <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-xs px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
                      Cuối Toa
                      <ArrowDown size={16} className="text-slate-300" />
                    </div>
                  </div>

                  {/* Decorative train cab curve bottom */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-200 rounded-t-3xl"></div>

                </div>
              </div>

              <div className="p-6 sm:p-8 bg-white">
                <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-white border-2 border-slate-200 rounded-md shadow-sm flex items-center justify-center text-slate-400"><Armchair size={14} /></div>
                    <span className="text-sm font-medium text-slate-600">Ghế ngồi</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-amber-50 border-2 border-amber-200 rounded-md shadow-sm flex items-center justify-center text-amber-500"><BedDouble size={14} /></div>
                    <span className="text-sm font-medium text-slate-600">Giường nằm</span>
                  </div>
                  {!readOnly && (
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-600 border-2 border-blue-700 rounded-md shadow-md shadow-blue-600/20 flex items-center justify-center text-white"><CheckCircle2 size={14} /></div>
                      <span className="text-sm font-medium text-slate-600">Đã chọn</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-slate-100 border-2 border-slate-200 rounded-md flex items-center justify-center text-slate-400"><Lock size={14} /></div>
                    <span className="text-sm font-medium text-slate-600">Đã bán / Khóa</span>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
