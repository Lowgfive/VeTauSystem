import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { cn } from './ui/utils';
import { 
  Armchair, 
  BedDouble, 
  Info, 
  CheckCircle2, 
  Lock, 
  ArrowUp, 
  ArrowDown,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { seatService, SeatInfo } from '../services/seat.service';
import { toast } from 'sonner';
import { getSocket, connectSocket, joinScheduleRoom, leaveScheduleRoom } from '../config/socket';
import { addMyLock, removeMyLock, isMyLock, getMyLocks } from '../utils/mySeatLocks';
import { useAppSelector } from "../hooks/useRedux";
import { useNavigate, useLocation } from "react-router-dom";


// Reusable Seat Item Internal Component
const SeatItem = React.memo(({ 
  seat, 
  isSelected, 
  onSelect, 
  readOnly,
  isProcessing 
}: { 
  seat: SeatInfo; 
  isSelected: boolean; 
  onSelect: (seat: SeatInfo) => void; 
  readOnly?: boolean;
  isProcessing?: boolean;
}) => {
  const isSleeper = ['sleeper_6', 'sleeper_4', 'vip_sleeper_2'].includes(seat.seatType);
  const Icon = isSleeper ? BedDouble : Armchair;
  
  const status = isSelected ? 'selected' : seat.status;

  let baseStyle = "relative flex flex-col items-center justify-center w-12 h-14 sm:w-14 sm:h-16 rounded-xl text-sm font-bold transition-all duration-300 shadow-sm border-2 group overflow-hidden select-none outline-none focus:outline-none";
  let colorClasses = "";

  if (status === 'selected') {
    colorClasses = 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/30 transform scale-105 z-10';
  } else if (status === 'booked') {
    colorClasses = 'bg-red-500 border-red-600 text-white cursor-not-allowed opacity-90';
  } else if (status === 'locked') {
    colorClasses = 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60';
  } else {
    colorClasses = isSleeper 
      ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 hover:border-amber-400 cursor-pointer' 
      : 'bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50 cursor-pointer';
  }

  return (
    <button
      onClick={() => onSelect(seat)}
      disabled={readOnly || status === 'booked' || status === 'locked' || isProcessing}
      className={cn(baseStyle, colorClasses, (readOnly || isProcessing) && 'cursor-default opacity-80')}
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

      {isProcessing ? (
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      ) : (
        <span className="relative z-10 mt-3 sm:mt-4 text-sm sm:text-base">{seat.seatNumber}</span>
      )}

      {status === 'selected' && !isProcessing && (
        <div className="absolute -top-1 -right-1 bg-white rounded-full text-blue-600 shadow-sm border">
          <CheckCircle2 size={14} className="fill-blue-600 text-white" />
        </div>
      )}
      {(status === 'locked') && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-400 opacity-50">
          <Lock size={20} />
        </div>
      )}
    </button>
  );
});

SeatItem.displayName = "SeatItem";

export interface SeatMapProps {
  scheduleId: string;
  schedule: any;
  selectedSeats: SeatInfo[];
  onSeatSelect: (seat: SeatInfo) => void;
  onSeatDeselect: (seatId: string) => void;
  /** Khôi phục ghế đã khóa (sessionStorage) sau refresh / đổi tàu quay lại */
  onRestoreHeldSeats?: (seats: SeatInfo[]) => void;
}

export function SeatMap({ scheduleId, schedule, selectedSeats, onSeatSelect, onSeatDeselect, onRestoreHeldSeats }: SeatMapProps) {
  const departureStationId = schedule?.origin?.id || schedule?.originId;
  const arrivalStationId = schedule?.destination?.id || schedule?.destinationId;

  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAppSelector((s) => s.auth);

  const [seats, setSeats] = useState<SeatInfo[]>([]);

  const [loading, setLoading] = useState(true);
  const [activeCarriage, setActiveCarriage] = useState<string>('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const selectedSeatsRef = useRef<SeatInfo[]>([]);

  useEffect(() => {
    selectedSeatsRef.current = selectedSeats;
  }, [selectedSeats]);

  // 1. Fetch data safely
  useEffect(() => {
    if (!scheduleId) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const res = await seatService.getSeatsBySchedule(scheduleId);
        if (res.success && res.data && Array.isArray(res.data.seats)) {
          setSeats(res.data.seats);
          
          if (onRestoreHeldSeats) {
             const heldSeats = res.data.seats.filter(s => s.status === 'locked' && isMyLock(scheduleId, s.seatId));
             if (heldSeats.length > 0) {
                 // Gán lại timer tạm 5 phút nếu ko lấy đc từ BE để tránh Timer bị rỗng
                 const restored = heldSeats.map(s => ({ ...s, expiresAt: Date.now() + 5 * 60 * 1000 }));
                 onRestoreHeldSeats(restored);
             }
          }

          if (res.data.seats.length > 0) {
            setActiveCarriage(res.data.seats[0].carriageId);
          }
        } else {
          setSeats([]);
        }
      } catch (err) {
        console.error("Failed to fetch seats:", err);
        toast.error("Không thể tải sơ đồ ghế. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ fetch khi scheduleId đổi; activeCarriage chỉ set lần đầu trong loadData
  }, [scheduleId, onRestoreHeldSeats]);

  // Handle Real-time Socket Updates
  useEffect(() => {
    if (!scheduleId) return;

    connectSocket();
    joinScheduleRoom(scheduleId);
    const socket = getSocket();

    const handleSeatUnlocked = (data: { scheduleId: string, seatNumber: string }) => {
      if (data.scheduleId === scheduleId) {
   
        setSeats(prev => prev.map(seat => 
          seat.seatNumber === data.seatNumber 
            ? { ...seat, status: "available" } 
            : seat
        ));
      }
    };

    const handleSeatLocked = (data: { scheduleId: string, seatNumber: string }) => {
      if (data.scheduleId === scheduleId) {
        
        setSeats(prev => prev.map(seat => {
          if (seat.seatNumber !== data.seatNumber) return seat;
  
          return { ...seat, status: "locked" as const };
        }));
      }
    };

    socket.on("seat-unlocked", handleSeatUnlocked);
    socket.on("seat-locked", handleSeatLocked);

    return () => {
      socket.off("seat-unlocked", handleSeatUnlocked);
      socket.off("seat-locked", handleSeatLocked);
      leaveScheduleRoom(scheduleId);
    };
  }, [scheduleId]);

  // 2. Group seats by carriageId safely
  const seatsByCarriage = useMemo(() => {
    const groups: Record<string, SeatInfo[]> = {};
    if (!Array.isArray(seats)) return groups;

    seats.forEach(seat => {
      if (!groups[seat.carriageId]) {
        groups[seat.carriageId] = [];
      }
      groups[seat.carriageId].push(seat);
    });
    return groups;
  }, [seats]);

  const carriageIds = useMemo(() => Object.keys(seatsByCarriage), [seatsByCarriage]);

  // 3. Handle seat selection with API calls
  const handleSeatClick = useCallback(async (seat: SeatInfo) => {
    if (!scheduleId) return;

    const isCurrentlySelected = selectedSeats.some(s => s.seatId === seat.seatId);

    try {
      setProcessingId(seat.seatId);
      if (isCurrentlySelected) {
        await seatService.unlockSeat(scheduleId, seat.seatId).catch(() => {});
        removeMyLock(scheduleId, seat.seatId);
        onSeatDeselect(seat.seatId);
      } else {
        // Auth check
        if (!isAuthenticated) {
          toast.info("Vui lòng đăng nhập để chọn ghế");
          navigate("/login", { state: { from: location.pathname + location.search } });
          return;
        }

        // Enforce maximum 8 seats GLOBALLY across all trains (Outbound + Return)
        const myTotalLocks = getMyLocks().filter(l => isMyLock(l.scheduleId, l.seatId)).length;
        if (myTotalLocks >= 8) {
          toast.error('Chỉ được chọn tối đa 8 vé trên hệ thống cho một lần đặt.');
          setProcessingId(null);
          return;
        }
        if (!departureStationId || !arrivalStationId) {
            toast.error("Thiếu thông tin ga đi/đến để khóa ghế.");
            return;
        }
        
        try {
          const response: any = await seatService.lockSeat(scheduleId, seat.seatId, departureStationId, arrivalStationId);
          // Bỏ qua expiresAt của server vì nếu sai lệch múi giờ, client sẽ bị set isExpired = true và tự động xóa khỏi giỏ vé ngay lập tức
          const seatExpiresAt = Date.now() + 5 * 60 * 1000;
          
          addMyLock(scheduleId, seat.seatId);
          onSeatSelect({ ...seat, expiresAt: seatExpiresAt });
        } catch (err: any) {
          if (err.response?.status === 401) {
            toast.error("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.");
            navigate("/login", { state: { from: location.pathname + location.search } });
          } else {
            throw err; // Re-throw for outer catch
          }
        }
      }
    } catch (err: any) {
      if (!isCurrentlySelected) {
         toast.error(err.response?.data?.message || "Thao tác thất bại. Ghế có thể đã bị khóa.");
      }
    } finally {
      setProcessingId(null);
    }
  }, [scheduleId, selectedSeats]);

  // Removed Cleanup selection on unmount to keep locks active

  // 4. PREPARE RENDER DATA (Hooks must run unconditionally)
  const currentSeats = seatsByCarriage[activeCarriage] || [];

  const sortedSeats = useMemo(() => {
    return [...currentSeats].sort((a, b) => a.seatNumber.localeCompare(b.seatNumber, undefined, { numeric: true }));
  }, [currentSeats]);

  const seatRows = useMemo(() => {
    const rows: { leftBlock: (SeatInfo | undefined)[]; rightBlock: (SeatInfo | undefined)[] }[] = [];
    const numRows = Math.ceil(sortedSeats.length / 4);
    
    for (let i = 0; i < numRows; i++) {
      const isEvenRow = i % 2 === 0;
      const rowSeats = sortedSeats.slice(i * 4, i * 4 + 4);
      
      let leftBlock: (SeatInfo | undefined)[] = [];
      let rightBlock: (SeatInfo | undefined)[] = [];
      
      // Zig-zag assignment matching Train layout logic
      if (isEvenRow) {
         leftBlock = [rowSeats[0], rowSeats[1]];
         rightBlock = [rowSeats[2], rowSeats[3]];
      } else {
         leftBlock = [rowSeats[3], rowSeats[2]];
         rightBlock = [rowSeats[1], rowSeats[0]];
      }
      rows.push({ leftBlock, rightBlock });
    }
    return rows;
  }, [sortedSeats]);

  // --- RENDERING LOGIC ---

  if (loading) {
    return (
      <div className="p-20 flex flex-col items-center justify-center text-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <h3 className="text-lg font-medium">Đang tải sơ đồ ghế...</h3>
      </div>
    );
  }

  if (carriageIds.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-center bg-slate-50 border border-slate-200 rounded-xl">
        <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
        <h3 className="text-md font-medium text-slate-500">Chưa có dữ liệu sơ đồ ghế</h3>
      </div>
    );
  }



  return (
    <div className="space-y-4 px-2 py-4">
      <Tabs value={activeCarriage} onValueChange={setActiveCarriage} className="w-full">
        <TabsList className="flex h-auto w-full gap-2 p-1.5 bg-slate-100 rounded-2xl overflow-x-auto justify-start sm:justify-center border border-slate-200">
          {carriageIds.map((cId, index) => (
            <TabsTrigger 
              key={cId} 
              value={cId}
              className="px-6 py-2.5 rounded-xl font-bold whitespace-nowrap data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
            >
              Toa {index + 1}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCarriage} className="mt-8">
          <Card className="overflow-hidden border-0 shadow-2xl bg-white rounded-3xl">
            {/* Header info */}
            <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="text-xl font-black text-slate-800">Toa số {carriageIds.indexOf(activeCarriage) + 1}</h3>
                <p className="text-slate-500 text-sm flex items-center gap-1">
                  <Info size={14} /> {currentSeats[0]?.seatType || 'Ghế hành khách'}
                </p>
              </div>
            </div>

            {/* Visual Map */}
            <div className="p-4 sm:p-8 bg-slate-100/30 flex justify-center">
               <div className="flex flex-col relative px-4 sm:px-10 py-12 bg-white rounded-[3rem] border-8 border-slate-200 shadow-inner w-full max-w-sm mx-auto">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-200 rounded-b-2xl"></div>
                  
                  <div className="flex justify-center mb-10">
                    <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px] px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                      <ArrowUp size={12} /> Đầu Toa
                    </div>
                  </div>

                  <div className="flex flex-col gap-6">
                    {seatRows.map((row, idx) => (
                      <div key={idx} className="flex gap-4 sm:gap-8 justify-center items-center">
                        
                        {/* Left Column Block (2 Seats) */}
                        <div className="flex gap-2 sm:gap-3 justify-end w-[110px] sm:w-[130px]">
                          {row.leftBlock.map((seat, sIdx) => seat ? (
                            <SeatItem 
                              key={seat.seatId} 
                              seat={seat} 
                              isSelected={selectedSeats.some(s => s.seatId === seat.seatId)}
                              onSelect={handleSeatClick}
                              isProcessing={processingId === seat.seatId}
                            />
                          ) : (
                            <div key={`empty-l-${sIdx}`} className="w-12 h-14 sm:w-14 sm:h-16" />
                          ))}
                        </div>

                        {/* Aisle */}
                        <div className="flex flex-col items-center justify-center opacity-30 select-none border-l-2 border-r-2 border-dashed border-slate-300 w-8 h-16 relative">
                          {idx === Math.floor(seatRows.length / 2) && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-black text-slate-400 tracking-widest text-[10px] uppercase rotate-90 whitespace-nowrap">
                              Lối đi
                            </div>
                          )}
                        </div>

                        {/* Right Column Block (2 Seats) */}
                        <div className="flex gap-2 sm:gap-3 justify-start w-[110px] sm:w-[130px]">
                          {row.rightBlock.map((seat, sIdx) => seat ? (
                            <SeatItem 
                              key={seat.seatId} 
                              seat={seat} 
                              isSelected={selectedSeats.some(s => s.seatId === seat.seatId)}
                              onSelect={handleSeatClick}
                              isProcessing={processingId === seat.seatId}
                            />
                          ) : (
                            <div key={`empty-r-${sIdx}`} className="w-12 h-14 sm:w-14 sm:h-16" />
                          ))}
                        </div>

                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center mt-10">
                    <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px] px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                      Cuối Toa <ArrowDown size={12} />
                    </div>
                  </div>
               </div>
            </div>

            {/* Legend & Action */}
            <div className="p-6 bg-white border-t border-slate-100">
              <div className="flex flex-wrap justify-center gap-6 mb-8">
                <LegendItem color="bg-white border-slate-200" label="Trống" />
                <LegendItem color="bg-amber-50 border-amber-200" label="Giường nằm" />
                <LegendItem color="bg-blue-600 border-blue-600" label="Đang chọn" />
                <LegendItem color="bg-red-500 border-red-600" label="Đã bán" />
                <LegendItem color="bg-slate-100 border-slate-200" icon={<Lock size={12} />} label="Đã khóa" />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LegendItem({ color, label, icon }: { color: string, label: string, icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn("w-5 h-5 rounded border shadow-sm flex items-center justify-center", color)}>
        {icon}
      </div>
      <span className="text-xs font-semibold text-slate-600">{label}</span>
    </div>
  );
}
