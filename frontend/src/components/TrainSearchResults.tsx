import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Train, MapPin, Clock, Calendar, ShoppingBag, 
  Trash2, ArrowRight, Info, AlertCircle
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { cn } from './ui/utils';
import type { Schedule } from '../types';
import { SeatMap } from './SeatMap';
import { seatService, SeatInfo } from '../services/seat.service';
import { CountdownDisplay } from './CountdownDisplay';
import { toast } from 'sonner';
import { removeMyLock } from '../utils/mySeatLocks';
import { calculateSeatPrice } from '../utils/pricing';

interface DisplaySearchParams {
  originName: string;
  destinationName: string;
  date: string;
  returnDate?: string;
}

type TripSchedule = Schedule & { type?: 'departure' | 'return' };

interface TrainSearchResultsProps {
  schedules: TripSchedule[];
  searchParams: DisplaySearchParams;
  onSelectTrain: (outbound: TripSchedule, returnTrip?: TripSchedule) => void;
  onBack: () => void;
}

// Internal Component for the sleek Train Head visual
function TrainHeadCard({ 
  trip, 
  isSelected, 
  onClick 
}: { 
  trip: TripSchedule; 
  isSelected: boolean; 
  onClick: () => void; 
}) {
  const isFull = trip.availableSeats === 0;
  // If >0 but <= 10 seats left, we consider it nearly full
  const isNearlyFull = trip.availableSeats > 0 && trip.availableSeats <= 10;
  
  let colorClass = "bg-blue-500";
  let borderClass = "border-slate-200 hover:border-blue-300 hover:shadow-md";
  
  if (isSelected) {
    colorClass = "bg-blue-700";
    borderClass = "border-blue-500 shadow-lg ring-2 ring-blue-200 scale-105 z-10";
  } else if (isFull) {
    colorClass = "bg-red-500";
  } else if (isNearlyFull) {
    colorClass = "bg-orange-500";
  }

  return (
    <button 
      onClick={onClick} 
      className={cn(
        "min-w-[150px] flex-shrink-0 flex flex-col items-center bg-white border-2 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 ease-in-out relative", 
        borderClass
      )}
    >
      {/* Train Head Top Row */}
      <div className={cn("w-full py-2 flex flex-col items-center justify-center text-white", colorClass)}>
        <span className="font-black text-xl tracking-wider">{trip.train?.train_code || trip.trainId}</span>
      </div>
      
      {/* Train Info Center */}
      <div className="px-3 py-3 w-full text-xs text-center border-b-[3px] border-dashed border-gray-200 bg-slate-50 flex-1 flex flex-col justify-center">
        <div className="flex justify-between items-center mb-1.5">
          <span className="font-semibold text-slate-500">TG đi</span>
          <span className="font-bold text-slate-800 text-sm">{trip.departureTime}</span>
        </div>
        <div className="flex justify-between items-center mb-3">
          <span className="font-semibold text-slate-500">TG đến</span>
          <span className="font-bold text-slate-800 text-sm">{trip.arrivalTime}</span>
        </div>
        
        <div className="flex justify-between items-center text-[10px] text-slate-400 mt-auto uppercase font-bold tracking-wider">
          <span>SL chỗ đặt</span>
          <span>SL chỗ trống</span>
        </div>
        <div className="flex justify-between items-center font-black text-base mt-0.5">
          <span className="text-slate-700">{Math.max(0, (trip.train?.capacity || 0) - (trip.availableSeats || 0))}</span>
          <span className={cn(isFull ? "text-red-500" : (isNearlyFull ? "text-orange-500" : "text-blue-600"))}>
            {trip.availableSeats ?? 0}
          </span>
        </div>
      </div>
      
      {/* Train Wheels Pattern Bottom */}
      <div className="h-6 w-full bg-slate-800 flex justify-evenly items-center px-4 relative">
         <div className="absolute top-0 left-0 right-0 h-1 bg-slate-900 shadow-inner"></div>
         <div className="w-3 h-3 rounded-full bg-slate-300 border-2 border-slate-400 z-10 shadow-sm relative">
           <div className="absolute top-1 left-1/2 -translate-x-1/2 w-0.5 h-0.5 bg-slate-600 rounded-full"></div>
         </div>
         <div className="w-3 h-3 rounded-full bg-slate-300 border-2 border-slate-400 z-10 shadow-sm relative">
           <div className="absolute top-1 left-1/2 -translate-x-1/2 w-0.5 h-0.5 bg-slate-600 rounded-full"></div>
         </div>
      </div>
    </button>
  );
}

export function TrainSearchResults({ 
  schedules = [],
  searchParams,
  onSelectTrain,
  onBack 
}: TrainSearchResultsProps) {
  const navigate = useNavigate();

  // Selected schedule states
  const [selectedDeparture, setSelectedDeparture] = useState<TripSchedule | null>(() => {
    try {
      const saved = sessionStorage.getItem('selectedDeparture');
      if (saved && saved !== 'undefined') {
        const parsed = JSON.parse(saved);
        return (parsed && typeof parsed === 'object') ? parsed : null;
      }
    } catch (e) { console.error(e); }
    return null;
  });
  const [selectedReturn, setSelectedReturn] = useState<TripSchedule | null>(() => {
    try {
      const saved = sessionStorage.getItem('selectedReturn');
      if (saved && saved !== 'undefined') {
        const parsed = JSON.parse(saved);
        return (parsed && typeof parsed === 'object') ? parsed : null;
      }
    } catch (e) { console.error(e); }
    return null;
  });

  // Lifted Seat States for the Unified Cart
  const [outboundSeats, setOutboundSeats] = useState<SeatInfo[]>(() => {
    try {
      const saved = sessionStorage.getItem('outboundSeats');
      if (saved && saved !== 'undefined') {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) { console.error(e); }
    return [];
  });
  const [returnSeats, setReturnSeats] = useState<SeatInfo[]>(() => {
    try {
      const saved = sessionStorage.getItem('returnSeats');
      if (saved && saved !== 'undefined') {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) { console.error(e); }
    return [];
  });

  // Persist states
  useEffect(() => {
    if (selectedDeparture) sessionStorage.setItem('selectedDeparture', JSON.stringify(selectedDeparture));
    else sessionStorage.removeItem('selectedDeparture');
  }, [selectedDeparture]);

  useEffect(() => {
    if (selectedReturn) sessionStorage.setItem('selectedReturn', JSON.stringify(selectedReturn));
    else sessionStorage.removeItem('selectedReturn');
  }, [selectedReturn]);

  useEffect(() => {
    if (outboundSeats.length > 0) sessionStorage.setItem('outboundSeats', JSON.stringify(outboundSeats));
    else sessionStorage.removeItem('outboundSeats');
  }, [outboundSeats]);

  useEffect(() => {
    if (returnSeats.length > 0) sessionStorage.setItem('returnSeats', JSON.stringify(returnSeats));
    else sessionStorage.removeItem('returnSeats');
  }, [returnSeats]);

  const prevDepartureId = React.useRef(selectedDeparture?.id);
  const prevReturnId = React.useRef(selectedReturn?.id);

  // Split trips
  const departureTrips = useMemo(() => schedules.filter(t => t.type !== 'return'), [schedules]);
  const returnTrips = useMemo(() => schedules.filter(t => t.type === 'return'), [schedules]);

  // Bỏ chọn & ghế nếu sessionStorage / state còn id chuyến cũ (sau reseed DB hoặc tìm lại) — tránh GET /schedules/:id/seats → 404
  useEffect(() => {
    if (schedules.length === 0) return;
    const validIds = new Set(schedules.map((s) => String(s.id)));

    setSelectedDeparture((prev) =>
      prev && validIds.has(String(prev.id)) ? prev : null
    );
    setSelectedReturn((prev) =>
      prev && validIds.has(String(prev.id)) ? prev : null
    );
  }, [schedules]);

  useEffect(() => {
    if (schedules.length === 0) return;
    const validIds = new Set(schedules.map((s) => String(s.id)));
    if (!selectedDeparture || !validIds.has(String(selectedDeparture.id))) {
      setOutboundSeats([]);
    }
    if (!selectedReturn || !validIds.has(String(selectedReturn.id))) {
      setReturnSeats([]);
    }
  }, [schedules, selectedDeparture?.id, selectedReturn?.id]);

  const outboundSeatsRef = React.useRef(outboundSeats);
  useEffect(() => { outboundSeatsRef.current = outboundSeats; }, [outboundSeats]);

  const returnSeatsRef = React.useRef(returnSeats);
  useEffect(() => { returnSeatsRef.current = returnSeats; }, [returnSeats]);

  // Reset seats if a DIFFERENT train is selected
  useEffect(() => { 
    if (selectedDeparture?.id !== prevDepartureId.current) {
      const oldScheduleId = prevDepartureId.current;
      if (oldScheduleId && outboundSeatsRef.current.length > 0) {
         outboundSeatsRef.current.forEach(seat => {
            seatService.unlockSeat(oldScheduleId, seat.seatId).catch(() => {});
            removeMyLock(oldScheduleId, seat.seatId);
         });
      }
      setOutboundSeats([]); 
      prevDepartureId.current = selectedDeparture?.id;
    }
  }, [selectedDeparture?.id]);
  
  useEffect(() => { 
    if (selectedReturn?.id !== prevReturnId.current) {
      const oldScheduleId = prevReturnId.current;
      if (oldScheduleId && returnSeatsRef.current.length > 0) {
         returnSeatsRef.current.forEach(seat => {
            seatService.unlockSeat(oldScheduleId, seat.seatId).catch(() => {});
            removeMyLock(oldScheduleId, seat.seatId);
         });
      }
      setReturnSeats([]); 
      prevReturnId.current = selectedReturn?.id;
    }
  }, [selectedReturn?.id]);

  const restoreOutboundSeats = useCallback((held: SeatInfo[]) => {
    setOutboundSeats((prev) => {
      const ids = new Set(prev.map((s) => s.seatId));
      const add = held.filter((s) => !ids.has(s.seatId));
      return add.length ? [...prev, ...add] : prev;
    });
  }, []);

  const restoreReturnSeats = useCallback((held: SeatInfo[]) => {
    setReturnSeats((prev) => {
      const ids = new Set(prev.map((s) => s.seatId));
      const add = held.filter((s) => !ids.has(s.seatId));
      return add.length ? [...prev, ...add] : prev;
    });
  }, []);

  const formatPrice = (price: number) => {
    const val = isNaN(price) ? 0 : price;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr; // Return as-is if invalid
    return date.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Logic to handle unlocking a seat remotely via API then removing from state
  const handleRemoveSeat = async (seatId: string, type: 'outbound' | 'return') => {
      const schedule = type === 'outbound' ? selectedDeparture : selectedReturn;
      const seats = type === 'outbound' ? outboundSeats : returnSeats;
      const setSeats = type === 'outbound' ? setOutboundSeats : setReturnSeats;
      
      const seat = seats.find(s => s.seatId === seatId);
      if (!seat || !schedule) return;

      try {
          await seatService.unlockSeat(schedule.id, seat.seatNumber);
          removeMyLock(schedule.id, seatId);
          setSeats(prev => prev.filter(s => s.seatId !== seatId));
      } catch(e: any) {
          toast.error(e.response?.data?.message || "Không thể xoá ghế");
      }
  };

  // Navigates to the merged passenger validation step
  const handleCheckout = () => {
    if (searchParams.returnDate) {
        if (!selectedDeparture || outboundSeats.length === 0) {
            toast.error("Vui lòng chọn ghế chiều đi.");
            return;
        }
        if (!selectedReturn || returnSeats.length === 0) {
            toast.error("Vui lòng chọn ghế chiều về.");
            return;
        }
        if (outboundSeats.length !== returnSeats.length) {
            toast.error("Vui lòng chọn số lượng ghế bằng nhau cho cả hai chiều.");
            return;
        }
        navigate(`/booking/passenger-info/round-trip`, { 
            state: { 
                selectedSeats: returnSeats, 
                schedule: selectedReturn,      
                outboundState: { schedule: selectedDeparture, selectedSeats: outboundSeats }
            } 
        });
    } else {
        if (!selectedDeparture || outboundSeats.length === 0) {
            toast.error("Vui lòng chọn ít nhất 1 ghế.");
            return;
        }
        navigate(`/booking/passenger-info/${selectedDeparture.id}`, { 
           state: { selectedSeats: outboundSeats, schedule: selectedDeparture, scheduleId: selectedDeparture.id } 
        });
    }
  };

  let totalPrice = 0;
  outboundSeats.forEach(s => totalPrice += calculateSeatPrice(selectedDeparture?.basePrice || 0, s.seatType));
  returnSeats.forEach(s => totalPrice += calculateSeatPrice(selectedReturn?.basePrice || 0, s.seatType));

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Top Strip Header */}
      <div className="bg-blue-800 text-white shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-blue-100 hover:text-white hover:bg-blue-700">
             ← Quay lại
          </Button>
          <div className="flex items-center gap-6 font-medium text-sm">
             <span className="flex items-center gap-2"><MapPin size={16}/> {searchParams.originName}</span>
             <ArrowRight size={16} className="text-blue-300" />
             <span className="flex items-center gap-2"><MapPin size={16}/> {searchParams.destinationName}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-6">
        <div className="flex flex-row gap-4 xl:gap-8">
           
           {/* Left Column: Train Flow */}
           <main className="flex-1 min-w-0 space-y-10">
             
             {/* Outbound Journey Section */}
             <div className="space-y-4">
               <div className="flex flex-col">
                  <h2 className="text-2xl md:text-3xl font-black text-slate-800 flex items-center gap-3">
                     <span className="bg-blue-600 text-white w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center text-lg shadow-md">1</span>
                     CHỌN TÀU CHIỀU ĐI
                  </h2>
                  <p className="text-slate-500 ml-[52px] flex items-center gap-2 mt-1.5 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                    <span className="text-blue-600 font-bold max-w-[150px] truncate">{searchParams.originName}</span>
                    <ArrowRight size={16} className="text-slate-400 flex-shrink-0" />
                    <span className="text-blue-600 font-bold max-w-[150px] truncate">{searchParams.destinationName}</span>
                    <span className="text-slate-300 mx-2">|</span>
                    <Calendar size={16} className="text-slate-400 flex-shrink-0" />
                    <span className="truncate">{formatDate(searchParams.date)}</span>
                  </p>
               </div>

               <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-blue-600 text-white px-5 py-3 font-bold flex flex-col sm:flex-row items-center justify-between gap-2">
                     <div className="flex items-center gap-2">
                       <span className="bg-white/20 px-2 py-0.5 rounded text-sm uppercase tracking-wider">Chiều đi</span>
                       <span className="text-white/90">{formatDate(searchParams.date)}</span>
                     </div>
                     <span className="text-blue-100 text-sm font-medium">{departureTrips.length} chuyến tàu tìm thấy</span>
                  </div>

                  <div className="p-6">
                     {departureTrips.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                           <AlertCircle className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                           <p>Không tìm thấy chuyến tàu nào cho ngày đã chọn</p>
                        </div>
                     ) : (
                        <>
                           {/* Train Carousels Row */}
                           <div className="flex overflow-x-auto gap-4 pb-6 scrollbar-hide snap-x pt-2">
                              {departureTrips.map(trip => (
                                 <div key={trip.id} className="snap-start">
                                   <TrainHeadCard 
                                      trip={trip as TripSchedule} 
                                      isSelected={selectedDeparture?.id === trip.id} 
                                      onClick={() => setSelectedDeparture(trip as TripSchedule)} 
                                   />
                                 </div>
                              ))}
                           </div>

                           {/* Embedded Seat Map Overlay */}
                           {selectedDeparture && (
                              <div className="border border-blue-200 bg-slate-50/50 rounded-2xl overflow-hidden animate-in slide-in-from-top-4 fade-in duration-300 shadow-inner mt-2">
                                 <SeatMap 
                                   scheduleId={selectedDeparture.id} 
                                   schedule={selectedDeparture} 
                                   selectedSeats={outboundSeats}
                                   onSeatSelect={(seat) => setOutboundSeats(prev => [...prev, seat])}
                                   onSeatDeselect={(seatId) => setOutboundSeats(prev => prev.filter(s => s.seatId !== seatId))}
                                   onRestoreHeldSeats={restoreOutboundSeats}
                                 />
                              </div>
                           )}
                        </>
                     )}
                  </div>
               </section>
             </div>

             {/* Return Journey Section */}
             {searchParams.returnDate && (
             <div className="space-y-4 pt-6 border-t-2 border-dashed border-slate-200">
               <div className="flex flex-col">
                  <h2 className="text-2xl md:text-3xl font-black text-slate-800 flex items-center gap-3">
                     <span className="bg-teal-600 text-white w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center text-lg shadow-md">2</span>
                     CHỌN TÀU CHIỀU VỀ
                  </h2>
                  <p className="text-slate-500 ml-[52px] flex items-center gap-2 mt-1.5 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                    <span className="text-teal-600 font-bold max-w-[150px] truncate">{searchParams.destinationName}</span>
                    <ArrowRight size={16} className="text-slate-400 flex-shrink-0" />
                    <span className="text-teal-600 font-bold max-w-[150px] truncate">{searchParams.originName}</span>
                    <span className="text-slate-300 mx-2">|</span>
                    <Calendar size={16} className="text-slate-400 flex-shrink-0" />
                    <span className="truncate">{formatDate(searchParams.returnDate)}</span>
                  </p>
               </div>

               <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-teal-600 text-white px-5 py-3 font-bold flex flex-col sm:flex-row items-center justify-between gap-2">
                     <div className="flex items-center gap-2">
                       <span className="bg-white/20 px-2 py-0.5 rounded text-sm uppercase tracking-wider">Chiều về</span>
                       <span className="text-white/90">{formatDate(searchParams.returnDate)}</span>
                     </div>
                     <span className="text-teal-100 text-sm font-medium">{returnTrips.length} chuyến tàu tìm thấy</span>
                  </div>

                  <div className="p-6">
                     {returnTrips.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                           <AlertCircle className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                           <p>Không tìm thấy chuyến tàu nào chiều về cho ngày đã chọn</p>
                        </div>
                     ) : (
                        <>
                           {/* Train Carousels Row */}
                           <div className="flex overflow-x-auto gap-4 pb-6 scrollbar-hide snap-x pt-2">
                              {returnTrips.map(trip => (
                                 <div key={trip.id} className="snap-start">
                                   <TrainHeadCard 
                                      trip={trip as TripSchedule} 
                                      isSelected={selectedReturn?.id === trip.id} 
                                      onClick={() => setSelectedReturn(trip as TripSchedule)} 
                                   />
                                 </div>
                              ))}
                           </div>

                           {/* Embedded Seat Map Overlay */}
                           {selectedReturn && (
                              <div className="border border-teal-200 bg-slate-50/50 rounded-2xl overflow-hidden animate-in slide-in-from-top-4 fade-in duration-300 shadow-inner mt-2">
                                 <SeatMap 
                                   scheduleId={selectedReturn.id} 
                                   schedule={selectedReturn} 
                                   selectedSeats={returnSeats}
                                   onSeatSelect={(seat) => setReturnSeats(prev => [...prev, seat])}
                                   onSeatDeselect={(seatId) => setReturnSeats(prev => prev.filter(s => s.seatId !== seatId))}
                                   onRestoreHeldSeats={restoreReturnSeats}
                                 />
                              </div>
                           )}
                        </>
                     )}
                  </div>
               </section>
             </div>
             )}
           </main>

           {/* Right Column: Persistent Cart Sidebar */}
           <aside className="w-[300px] xl:w-[340px] flex-shrink-0 relative">
             <div className="sticky top-20 flex flex-col gap-6 w-full">
               
               {/* Cart Box */}
               <Card className="border-blue-100 shadow-xl shadow-blue-900/5 bg-white overflow-hidden">
                 <div className="bg-slate-50 px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                   <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><ShoppingBag size={20} /></div>
                   <h3 className="font-bold text-lg text-slate-800">Giỏ Vé Của Bạn</h3>
                 </div>
                 
                 <div className="p-5 max-h-[45vh] overflow-y-auto space-y-6">
                    {/* Outbound Cart Items */}
                    {outboundSeats.length > 0 && (
                       <div className="space-y-3">
                          <h4 className="text-[11px] font-black tracking-widest text-slate-400 uppercase border-b pb-1">Chiều đi • {selectedDeparture?.train?.train_code}</h4>
                          <div className="grid grid-cols-1 gap-2">
                             {outboundSeats.map(seat => (
                                <div key={seat.seatId} className="flex justify-between items-center bg-blue-50/50 p-2.5 rounded-xl border border-blue-100 group">
                                   <div>
                                     <span className="font-black text-blue-800 text-sm bg-blue-100/50 px-2 py-0.5 rounded mr-2">{seat.seatNumber}</span>
                                     <span className="text-xs font-semibold text-slate-600">{formatPrice(calculateSeatPrice(selectedDeparture?.basePrice || 0, seat.seatType))}</span>
                                   </div>
                                   <div className="flex items-center gap-3">
                                     {seat.expiresAt && <CountdownDisplay expiresAt={seat.expiresAt} className="text-[10px] py-0.5 border-none shadow-none" onExpire={() => handleRemoveSeat(seat.seatId, 'outbound')} />}
                                     <button onClick={() => handleRemoveSeat(seat.seatId, 'outbound')} className="text-slate-400 hover:text-red-500 transition-colors p-1 bg-white hover:bg-red-50 rounded-md shadow-sm border border-slate-200 hover:border-red-200">
                                        <Trash2 size={14} />
                                     </button>
                                   </div>
                                </div>
                             ))}
                          </div>
                       </div>
                    )}

                    {/* Return Cart Items */}
                    {returnSeats.length > 0 && (
                       <div className="space-y-3">
                          <h4 className="text-[11px] font-black tracking-widest text-slate-400 uppercase border-b pb-1">Chiều về • {selectedReturn?.train?.train_code}</h4>
                          <div className="grid grid-cols-1 gap-2">
                             {returnSeats.map(seat => (
                                <div key={seat.seatId} className="flex justify-between items-center bg-teal-50/50 p-2.5 rounded-xl border border-teal-100 group">
                                   <div>
                                     <span className="font-black text-teal-800 text-sm bg-teal-100/50 px-2 py-0.5 rounded mr-2">{seat.seatNumber}</span>
                                     <span className="text-xs font-semibold text-slate-600">{formatPrice(calculateSeatPrice(selectedReturn?.basePrice || 0, seat.seatType))}</span>
                                   </div>
                                   <div className="flex items-center gap-3">
                                     {seat.expiresAt && <CountdownDisplay expiresAt={seat.expiresAt} className="text-[10px] py-0.5 border-none shadow-none text-teal-700 bg-teal-100" onExpire={() => handleRemoveSeat(seat.seatId, 'return')} />}
                                     <button onClick={() => handleRemoveSeat(seat.seatId, 'return')} className="text-slate-400 hover:text-red-500 transition-colors p-1 bg-white hover:bg-red-50 rounded-md shadow-sm border border-slate-200 hover:border-red-200">
                                        <Trash2 size={14} />
                                     </button>
                                   </div>
                                </div>
                             ))}
                          </div>
                       </div>
                    )}

                    {outboundSeats.length === 0 && returnSeats.length === 0 && (
                       <div className="flex flex-col items-center justify-center py-6 text-slate-400">
                          <Info size={32} className="opacity-20 mb-3" />
                          <p className="text-sm font-medium">Chưa chọn ghế nào</p>
                          <p className="text-xs mt-1 text-center">Vui lòng chọn tàu và ghế từ danh sách bên trái</p>
                       </div>
                    )}
                 </div>

                 <div className="bg-slate-50 p-5 border-t border-slate-100">
                    <div className="flex justify-between items-end mb-4">
                       <span className="font-bold text-slate-500 text-sm uppercase">Tổng tiền</span>
                       <span className="font-black text-2xl text-blue-700 leading-none">{formatPrice(totalPrice)}</span>
                    </div>
                    <Button 
                      className="w-full py-6 text-base font-bold rounded-xl shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-all bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-0"
                      disabled={outboundSeats.length === 0 || (!!searchParams.returnDate && outboundSeats.length !== returnSeats.length)}
                      onClick={handleCheckout}
                    >
                      {searchParams.returnDate && outboundSeats.length > 0 && outboundSeats.length !== returnSeats.length 
                        ? `Thiếu ${outboundSeats.length - returnSeats.length > 0 ? outboundSeats.length - returnSeats.length : returnSeats.length - outboundSeats.length} ghế ${outboundSeats.length > returnSeats.length ? 'chiều về' : 'chiều đi'}`
                        : "Tiếp tục đặt vé"
                      }
                    </Button>
                 </div>
               </Card>

               {/* Trip Context Box */}
               <Card className="p-5 border-slate-200 bg-white/60 backdrop-blur-sm">
                 <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide border-b border-slate-200 pb-2 mb-4">
                   Thông tin tìm kiếm
                 </h3>
                 <div className="space-y-4 text-sm">
                    <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                       <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Hành trình</span>
                       <div className="font-semibold text-slate-800 flex items-center justify-between">
                         <span className="truncate">{searchParams.originName}</span>
                         <ArrowRight size={14} className="text-slate-300 mx-2 flex-shrink-0" />
                         <span className="truncate">{searchParams.destinationName}</span>
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                       <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                         <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Ngày đi</span>
                         <span className="font-semibold text-blue-700">{formatDate(searchParams.date).split(',')[1]?.trim() || formatDate(searchParams.date)}</span>
                       </div>
                       <div className={cn("p-3 rounded-lg border shadow-sm", searchParams.returnDate ? "bg-white border-slate-100" : "bg-slate-50 border-transparent opacity-60")}>
                         <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Ngày về</span>
                         <span className={cn("font-semibold", searchParams.returnDate ? "text-teal-700" : "text-slate-400")}>
                           {searchParams.returnDate ? (formatDate(searchParams.returnDate).split(',')[1]?.trim() || formatDate(searchParams.returnDate)) : "Một chiều"}
                         </span>
                       </div>
                    </div>
                 </div>
               </Card>

             </div>
           </aside>
           
        </div>
      </div>
    </div>
  );
}
