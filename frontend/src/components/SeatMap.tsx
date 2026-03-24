import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { cn } from './ui/utils';
import { Loader2, AlertCircle, Info, Baby, GraduationCap, UserCheck, CheckCircle2 } from 'lucide-react';
import { seatService, SeatInfo } from '../services/seat.service';
import { toast } from 'sonner';
import { getSocket, connectSocket, joinTrainRoom, leaveTrainRoom } from '../config/socket';
import { addMyLock, removeMyLock, isMyLock, getMyLocks, SEAT_HOLD_TTL_MS } from '../utils/mySeatLocks';
import { useAppSelector } from "../hooks/useRedux";
import { useNavigate, useLocation } from "react-router-dom";

type SeatSocketEvent = {
  trainId: string;
  seatId: string;
  seatNumber: string;
  depOrder?: number;
  arrOrder?: number;
};

const normalizeRange = (start: number, end: number) => ({
  start: Math.min(start, end),
  end: Math.max(start, end),
});

const rangesOverlap = (
  startA?: number,
  endA?: number,
  startB?: number,
  endB?: number
) => {
  if (startA == null || endA == null || startB == null || endB == null) {
    return true;
  }

  const rangeA = normalizeRange(startA, endA);
  const rangeB = normalizeRange(startB, endB);
  return Math.max(rangeA.start, rangeB.start) < Math.min(rangeA.end, rangeB.end);
};


// Mapping labels for seat types (Legacy - now primarily used as fallback)
const SEAT_TYPE_LABELS: Record<string, string> = {
  hard_seat: 'Ghế ngồi cứng',
  soft_seat: 'Ngồi mềm chất lượng cao',
  sleeper_6: 'Giường nằm khoang 6',
  sleeper_4: 'Giường nằm khoang 4',
  vip_sleeper_2: 'Giường VIP khoang 2',
};

const normalizeSeatType = (value?: string) => (value || '').trim().toLowerCase();

const SeatItem = React.memo(({
  seat,
  isSelected,
  onSelect,
  readOnly,
  isProcessing,
  orientation = 'left',
  overrideClass = '',
  overrideColor = ''
}: {
  seat: SeatInfo;
  isSelected: boolean;
  onSelect: (seat: SeatInfo) => void;
  readOnly?: boolean;
  isProcessing?: boolean;
  orientation?: 'left' | 'right';
  overrideClass?: string;
  overrideColor?: string;
}) => {
  const status = overrideColor || (isSelected ? 'selected' : seat.status);

  let bgCushion = "#ffffff";
  let borderCushion = "#cbd5e1";
  let bgBackrest = "#94a3b8";
  let textColor = "#64748b";

  if (status === 'selected') {
    bgCushion = "#22c55e"; // Success Green
    borderCushion = "#16a34a";
    bgBackrest = "#14532d";
    textColor = "#ffffff";
  } else if (status === 'booked') {
    bgCushion = "#ef4444"; // Error Red
    borderCushion = "#dc2626";
    bgBackrest = "#7f1d1d";
    textColor = "#ffffff";
  } else if (status === 'locked') {
    bgCushion = "#475569"; // Slate 600
    borderCushion = "#334155";
    bgBackrest = "#1e293b";
    textColor = "#ffffff";
  }

  return (
    <button
      onClick={() => onSelect(seat)}
      disabled={readOnly || status === 'booked' || status === 'locked' || isProcessing}
      className={cn(
        "relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 transition-all duration-300 outline-none hover:scale-105 group",
        (readOnly || isProcessing) && 'cursor-default opacity-90 hover:scale-100',
        overrideClass
      )}
      style={{ userSelect: 'none' }}
      title={seat.seatNumber}
    >
      <svg viewBox="0 0 40 40" className="absolute inset-0 w-full h-full z-0 drop-shadow-sm transition-colors duration-300">
        {orientation === 'left' ? (
          <>
            {/* Backrest Left */}
            <rect x="4" y="6" width="6" height="28" rx="3" fill={bgBackrest} className="transition-colors duration-300" />
            {/* Cushion */}
            <rect x="12" y="6" width="24" height="28" rx="6" fill={bgCushion} stroke={borderCushion} strokeWidth="2" className="transition-colors duration-300" />
          </>
        ) : (
          <>
            {/* Backrest Right */}
            <rect x="30" y="6" width="6" height="28" rx="3" fill={bgBackrest} className="transition-colors duration-300" />
            {/* Cushion */}
            <rect x="4" y="6" width="24" height="28" rx="6" fill={bgCushion} stroke={borderCushion} strokeWidth="2" className="transition-colors duration-300" />
          </>
        )}
      </svg>

      <div className="relative z-10 font-bold text-[10px] sm:text-[11px] tracking-tight" style={{ color: textColor }}>
        {isProcessing ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin opacity-70 mt-0.5 mx-auto" />
        ) : (
          seat.seatNumber
        )}
      </div>
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
  const scheduleTrainId = schedule?.trainId || schedule?.train?._id;

  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAppSelector((s) => s.auth);

  const [seats, setSeats] = useState<SeatInfo[]>([]);

  const [loading, setLoading] = useState(true);
  const [activeCarriage, setActiveCarriage] = useState<string>('');
  const [carriagesMetadata, setCarriagesMetadata] = useState<any[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [trainId, setTrainId] = useState<string>(scheduleTrainId || '');
  const [journeyRange, setJourneyRange] = useState<{ depOrder?: number; arrOrder?: number }>({
    depOrder: schedule?.origin?.station_order,
    arrOrder: schedule?.destination?.station_order,
  });

  const selectedSeatsRef = useRef<SeatInfo[]>([]);
  const recentlyUnlockedSeatsRef = useRef<Map<string, number>>(new Map());
  const RECENT_UNLOCK_WINDOW_MS = 2000;

  useEffect(() => {
    selectedSeatsRef.current = selectedSeats;
  }, [selectedSeats]);

  // 1. Fetch data safely
  useEffect(() => {
    if (!scheduleId) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const res = await seatService.getSeatsBySchedule(
          scheduleId,
          departureStationId,
          arrivalStationId
        );
        if (res.success && res.data && Array.isArray(res.data.seats)) {
          setTrainId(res.data.trainId || scheduleTrainId || '');
          setJourneyRange({
            depOrder: res.data.depOrder ?? schedule?.origin?.station_order,
            arrOrder: res.data.arrOrder ?? schedule?.destination?.station_order,
          });
          setSeats(res.data.seats);

          if (onRestoreHeldSeats) {
            const heldSeats = res.data.seats.filter(s => s.status === 'locked' && isMyLock(scheduleId, s.seatId));
            if (heldSeats.length > 0) {
              // Gán lại timer tạm 5 phút nếu ko lấy đc từ BE để tránh Timer bị rỗng
              const restored = heldSeats.map(s => ({ ...s, expiresAt: Date.now() + SEAT_HOLD_TTL_MS }));
              onRestoreHeldSeats(restored);
            }
          }

          if (res.data.seats.length > 0) {
            setActiveCarriage(prev => prev || res.data.seats[0].carriageId);
            setCarriagesMetadata(res.data.carriages || []);
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
  }, [scheduleId, onRestoreHeldSeats, departureStationId, arrivalStationId, scheduleTrainId]);

  // Handle Real-time Socket Updates
  useEffect(() => {
    if (!trainId) return;

    connectSocket();
    joinTrainRoom(trainId);
    const socket = getSocket();

    const shouldApplySeatEvent = (data: SeatSocketEvent) =>
      data.trainId === trainId &&
      rangesOverlap(
        journeyRange.depOrder,
        journeyRange.arrOrder,
        data.depOrder,
        data.arrOrder
      );

    const isRecentlyUnlocked = (seatId: string) => {
      const unlockedAt = recentlyUnlockedSeatsRef.current.get(seatId);
      if (!unlockedAt) return false;

      if (Date.now() - unlockedAt > RECENT_UNLOCK_WINDOW_MS) {
        recentlyUnlockedSeatsRef.current.delete(seatId);
        return false;
      }

      return true;
    };

    const handleSeatUnlocked = async (data: SeatSocketEvent) => {
      if (!shouldApplySeatEvent(data)) return;

      try {
        const res = await seatService.getSeatsBySchedule(
          scheduleId,
          departureStationId,
          arrivalStationId
        );
        if (res.success && res.data && Array.isArray(res.data.seats)) {
          setJourneyRange({
            depOrder: res.data.depOrder ?? journeyRange.depOrder,
            arrOrder: res.data.arrOrder ?? journeyRange.arrOrder,
          });
          setSeats(res.data.seats);
          setCarriagesMetadata(res.data.carriages || []);
          if (selectedSeatsRef.current.some((seat) => seat.seatId === data.seatId)) {
            onSeatDeselect(data.seatId);
          }
        }
      } catch (error) {
        console.error("Failed to refresh seats after unlock event:", error);
      }
    };

    const handleSeatLocked = (data: SeatSocketEvent) => {
      if (!shouldApplySeatEvent(data)) return;
      if (isRecentlyUnlocked(data.seatId)) return;

      setSeats(prev => prev.map(seat => {
        if (seat.seatId !== data.seatId) return seat;
        return { ...seat, status: "locked" as const };
      }));
    };

    const handleSeatBooked = (data: SeatSocketEvent) => {
      if (!shouldApplySeatEvent(data)) return;

      setSeats(prev => prev.map(seat => {
        if (seat.seatId !== data.seatId) return seat;
        return { ...seat, status: "booked" as const };
      }));
    };

    socket.on("seat-unlocked", handleSeatUnlocked);
    socket.on("seat-locked", handleSeatLocked);
    socket.on("seat-booked", handleSeatBooked);

    return () => {
      socket.off("seat-unlocked", handleSeatUnlocked);
      socket.off("seat-locked", handleSeatLocked);
      socket.off("seat-booked", handleSeatBooked);
      leaveTrainRoom(trainId);
    };
  }, [
    trainId,
    scheduleId,
    departureStationId,
    arrivalStationId,
    journeyRange.depOrder,
    journeyRange.arrOrder,
    onSeatDeselect,
  ]);

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

  const carriageIds = useMemo(() => {
    return carriagesMetadata.map(c => c._id);
  }, [carriagesMetadata]);

  // 3. Handle seat selection with API calls
  const handleSeatClick = useCallback(async (seat: SeatInfo) => {
    if (!scheduleId) return;

    const isCurrentlySelected = selectedSeats.some(s => s.seatId === seat.seatId);

    try {
      setProcessingId(seat.seatId);
      if (isCurrentlySelected) {
        recentlyUnlockedSeatsRef.current.set(seat.seatId, Date.now());
        try {
          await seatService.unlockSeat(scheduleId, seat.seatId);
        } catch (err) {
          recentlyUnlockedSeatsRef.current.delete(seat.seatId);
          throw err;
        }
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
          const seatExpiresAt = Date.now() + SEAT_HOLD_TTL_MS;

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
      if (isCurrentlySelected) {
        toast.error(err.response?.data?.message || "Không thể bỏ chọn ghế. Vui lòng thử lại.");
      } else {
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
    return [...currentSeats].sort((a, b) => {
      const numA = parseInt(a.seatNumber.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.seatNumber.replace(/\D/g, '')) || 0;
      if (numA !== numB) return numA - numB;
      return a.seatNumber.localeCompare(b.seatNumber);
    });
  }, [currentSeats]);

  const seatGrid = useMemo(() => {
    const grid: (SeatInfo | null)[][] = [[], [], [], []];
    const numCols = Math.ceil(sortedSeats.length / 4);

    for (let c = 0; c < numCols; c++) {
      const isReversedCol = c % 2 === 1;
      for (let r = 0; r < 4; r++) {
        const mappedRow = isReversedCol ? (3 - r) : r;
        const seatIdx = c * 4 + r;
        grid[mappedRow].push(sortedSeats[seatIdx] || null);
      }
    }
    return grid;
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



  const activeCarriageData = carriagesMetadata.find(c => c._id === activeCarriage);
  const carriageNumber = activeCarriageData?.carriage_number || (carriageIds.indexOf(activeCarriage) + 1);
  const canonicalSeatType = normalizeSeatType(activeCarriageData?.seat_type || currentSeats[0]?.seatType);
  const carriageTypeLabel =
    SEAT_TYPE_LABELS[canonicalSeatType] ||
    activeCarriageData?.seat_type_name ||
    'Ghế hành khách';

  return (
    <div className="space-y-4 px-2 py-4">

      {/* Mini Train Map */}
      <div className="flex items-center justify-start xl:justify-center gap-1.5 sm:gap-2 overflow-x-auto py-6 px-4 select-none mb-4 scrollbar-hide border-b border-gray-200">
        {[...carriagesMetadata].reverse().map((meta) => {
          const cId = meta._id;
          const isCurrent = activeCarriage === cId;
          const carriageSeats = seatsByCarriage[cId] || [];
          const availableCount = carriageSeats.filter(s => s.status === 'available').length;

          let bgColor = isCurrent ? '#a2c33d' : (availableCount === 0 ? '#da533b' : '#309bd8');

          return (
            <div key={cId} className="flex flex-col items-center cursor-pointer group flex-shrink-0 relative transition-transform duration-300" onClick={() => setActiveCarriage(cId)}>

              <div className="w-[32px] h-[16px] sm:w-[38px] sm:h-[19px] relative group-hover:-translate-y-1 transition-transform duration-300 drop-shadow-md">
                <svg viewBox="0 0 60 30" className="w-full h-full">
                  {/* Connector */}
                  <rect x="54" y="14" width="6" height="4" fill="#9ca3af" />
                  {/* Wheels */}
                  <circle cx="15" cy="26" r="4" fill="#475569" />
                  <circle cx="45" cy="26" r="4" fill="#475569" />
                  {/* Main Body */}
                  <rect x="0" y="2" width="56" height="24" rx="4" fill={bgColor} stroke={isCurrent ? "#65a30d" : "transparent"} strokeWidth="1" />
                  {/* Windows */}
                  <rect x="6" y="6" width="10" height="10" rx="2" fill="#ffffff" opacity="0.9" />
                  <rect x="23" y="6" width="10" height="10" rx="2" fill="#ffffff" opacity="0.9" />
                  <rect x="40" y="6" width="10" height="10" rx="2" fill="#ffffff" opacity="0.9" />
                </svg>
              </div>

              <span className={cn("mt-1 text-[9px] sm:text-[10px] font-bold transition-all duration-300", isCurrent ? "scale-110" : "")} style={{ color: bgColor }}>{meta.carriage_number}</span>
              {/* Highlight indicator */}
              {isCurrent && <div className="absolute -bottom-1 w-full h-1 bg-[#a2c33d] rounded-t-lg"></div>}
            </div>
          )
        })}
        {/* Train head (Engine SE) */}
        <div className="flex flex-col items-center ml-0.5 sm:ml-1 flex-shrink-0 relative">
          <div className="w-[37px] h-[16px] sm:w-[44px] sm:h-[19px] relative drop-shadow-md">
            <svg viewBox="0 0 70 30" className="w-full h-full">
              {/* Wheels */}
              <circle cx="20" cy="26" r="4" fill="#475569" />
              <circle cx="55" cy="26" r="4" fill="#475569" />
              {/* Main Body with slanted front */}
              <path d="M 0 2 L 40 2 C 55 2 68 15 68 26 L 0 26 Z" fill="#1e7ebf" />
              {/* Window */}
              <path d="M 40 6 C 50 6 56 12 58 17 L 42 17 Z" fill="#ffffff" opacity="0.9" />
              {/* Side Windows */}
              <rect x="8" y="6" width="12" height="11" rx="2" fill="#ffffff" opacity="0.9" />
              <rect x="24" y="6" width="12" height="11" rx="2" fill="#ffffff" opacity="0.9" />
            </svg>
          </div>
          <span className="mt-1 text-[9px] sm:text-[10px] font-bold" style={{ color: '#1e7ebf' }}>SE</span>
        </div>
      </div>

      <div className="mt-2 relative">
        <h3 className="text-xl sm:text-2xl text-center mb-6 px-4 font-normal" style={{ color: '#1e7ebf' }}>
          Toa số {carriageNumber}: {carriageTypeLabel}
        </h3>

        {/* Global Keyframes injected here for ease */}
        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes slideInFade {
            0% { opacity: 0; transform: translateY(20px) scale(0.98); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
          .animate-seat-change {
            animation: slideInFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}} />

        <div className="p-2 sm:p-4 flex justify-center w-full overflow-x-auto scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex relative px-6 sm:px-10 py-6 bg-white w-auto items-center min-w-max animate-seat-change" key={activeCarriage} style={{ border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>

            {/* Train Locomotive Icon (Front Indicator) */}
            <div className="mr-6 sm:mr-10 flex flex-col items-center justify-center">
              <div className="w-14 h-24 sm:w-16 sm:h-28 relative">
                <svg viewBox="0 0 40 80" className="w-full h-full drop-shadow-md">
                  {/* Locomotive Body (Front view-ish or Side view) - Using a sleek side-front hybrid */}
                  <path d="M5,10 Q5,5 10,5 L30,5 Q35,5 35,10 L35,60 Q35,75 20,75 Q5,75 5,60 Z" fill="#334155" />
                  {/* Windshield */}
                  <rect x="10" y="10" width="20" height="15" rx="2" fill="#bae6fd" opacity="0.9" />
                  {/* Lights */}
                  <circle cx="12" cy="65" r="3" fill="#fbbf24" />
                  <circle cx="28" cy="65" r="3" fill="#fbbf24" />
                  {/* Logo/Detail */}
                  <rect x="15" y="35" width="10" height="2" fill="#ffffff" opacity="0.5" />
                  {/* Wheels beneath */}
                  <rect x="8" y="72" width="6" height="4" rx="1" fill="#1e293b" />
                  <rect x="26" y="72" width="6" height="4" rx="1" fill="#1e293b" />
                </svg>
                <div className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Đầu tàu</div>
              </div>
            </div>

            <div className="flex flex-col gap-2 relative z-10 transition-all duration-300">
              {/* Middle separator */}
              <div className="absolute left-[50%] -translate-x-1/2 top-0 bottom-0 w-8 flex flex-col justify-between z-0 bg-slate-50 rounded-full my-1 ring-1 ring-slate-100/50 hidden md:flex"></div>

              {/* Row 0 */}
              <div className="flex gap-2 sm:gap-4 justify-start z-10">
                {seatGrid[0].map((seat, cIdx) => {
                  const orientation = cIdx % 2 === 0 ? "left" : "right";
                  return seat ? <SeatItem key={seat.seatId} seat={seat} isSelected={selectedSeats.some(s => s.seatId === seat.seatId)} onSelect={handleSeatClick} isProcessing={processingId === seat.seatId} orientation={orientation} /> : <div key={`e-0-${cIdx}`} className="w-10 h-10 sm:w-12 sm:h-12 shrink-0" />;
                })}
              </div>
              {/* Row 1 */}
              <div className="flex gap-2 sm:gap-4 justify-start z-10">
                {seatGrid[1].map((seat, cIdx) => {
                  const orientation = cIdx % 2 === 0 ? "left" : "right";
                  return seat ? <SeatItem key={seat.seatId} seat={seat} isSelected={selectedSeats.some(s => s.seatId === seat.seatId)} onSelect={handleSeatClick} isProcessing={processingId === seat.seatId} orientation={orientation} /> : <div key={`e-1-${cIdx}`} className="w-10 h-10 sm:w-12 sm:h-12 shrink-0" />;
                })}
              </div>

              {/* Aisle */}
              <div className="w-full h-8 sm:h-10 flex items-center justify-center my-0 z-10">
              </div>

              {/* Row 2 */}
              <div className="flex gap-2 sm:gap-4 justify-start z-10">
                {seatGrid[2].map((seat, cIdx) => {
                  const orientation = cIdx % 2 === 0 ? "left" : "right";
                  return seat ? <SeatItem key={seat.seatId} seat={seat} isSelected={selectedSeats.some(s => s.seatId === seat.seatId)} onSelect={handleSeatClick} isProcessing={processingId === seat.seatId} orientation={orientation} /> : <div key={`e-2-${cIdx}`} className="w-10 h-10 sm:w-12 sm:h-12 shrink-0" />;
                })}
              </div>
              {/* Row 3 */}
              <div className="flex gap-2 sm:gap-4 justify-start z-10">
                {seatGrid[3].map((seat, cIdx) => {
                  const orientation = cIdx % 2 === 0 ? "left" : "right";
                  return seat ? <SeatItem key={seat.seatId} seat={seat} isSelected={selectedSeats.some(s => s.seatId === seat.seatId)} onSelect={handleSeatClick} isProcessing={processingId === seat.seatId} orientation={orientation} /> : <div key={`e-3-${cIdx}`} className="w-10 h-10 sm:w-12 sm:h-12 shrink-0" />;
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend block */}
      <div className="p-4 bg-white border border-gray-200 shadow-sm rounded-xl mt-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 text-sm text-gray-700">
          {/* Train carriage legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 xl:gap-8 pb-4 xl:pb-0 xl:border-r border-gray-200">
            <LegendCarriage color="#309bd8" label="Toa còn vé" />
            <LegendCarriage color="#a2c33d" label="Toa đang chọn" />
            <LegendCarriage color="#da533b" label="Toa hết vé" />
          </div>
          {/* Seat legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 xl:gap-8">
            <LegendSeat overrideColor="available" label="Chỗ trống" />
            <LegendSeat overrideColor="locked" label="Chỗ chưa cắt chặng" />
            <LegendSeat overrideColor="booked" label="Chỗ đã bán" />
          </div>
        </div>
      </div>

      {/* Discount Policy Section */}
      <div className="mt-8 p-5 bg-gradient-to-br from-blue-50 via-white to-indigo-50 border border-blue-100 rounded-2xl shadow-sm relative overflow-hidden group">
        {/* Decorative element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/30 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700"></div>

        <div className="flex items-center gap-3 mb-5 relative z-10">
          <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
            <Info className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-blue-900 text-lg">Chính sách ưu đãi & Giảm giá</h4>
            <p className="text-xs text-blue-600 font-medium">Áp dụng cho hành khách chính chủ</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10">
          <div className="flex flex-col p-3 bg-white/60 backdrop-blur-sm border border-blue-50 rounded-xl hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-1.5 bg-green-100 rounded-lg">
                <Baby className="w-4 h-4 text-green-600" />
              </div>
              <span className="font-bold text-gray-900 text-sm">Trẻ em nhỏ</span>
            </div>
            <p className="text-[11px] text-gray-500 mb-1 leading-relaxed">Dưới 6 tuổi</p>
            <div className="mt-auto flex items-center justify-between">
              <span className="text-green-600 font-bold text-xs">MIỄN PHÍ</span>
              <CheckCircle2 className="w-3 h-3 text-green-500" />
            </div>
          </div>

          <div className="flex flex-col p-3 bg-white/60 backdrop-blur-sm border border-blue-50 rounded-xl hover:shadow-md transition-shadow cursor-default">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <Baby className="w-4 h-4 text-blue-600" />
              </div>
              <span className="font-bold text-gray-900 text-sm">Trẻ em</span>
            </div>
            <p className="text-[11px] text-gray-500 mb-1 leading-relaxed">Từ 6 đến 10 tuổi</p>
            <div className="mt-auto flex items-center justify-between">
              <span className="text-blue-600 font-bold text-xs">GIẢM 25%</span>
            </div>
          </div>

          <div className="flex flex-col p-3 bg-white/60 backdrop-blur-sm border border-blue-50 rounded-xl hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-1.5 bg-indigo-100 rounded-lg">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
              </div>
              <span className="font-bold text-gray-900 text-sm">Sinh viên</span>
            </div>
            <p className="text-[11px] text-gray-500 mb-1 leading-relaxed">Tất cả các trường</p>
            <div className="mt-auto flex items-center justify-between">
              <span className="text-indigo-600 font-bold text-xs">GIẢM 10%</span>
            </div>
          </div>

          <div className="flex flex-col p-3 bg-white/60 backdrop-blur-sm border border-blue-50 rounded-xl hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-1.5 bg-purple-100 rounded-lg">
                <UserCheck className="w-4 h-4 text-purple-600" />
              </div>
              <span className="font-bold text-gray-900 text-sm">Người cao tuổi</span>
            </div>
            <p className="text-[11px] text-gray-500 mb-1 leading-relaxed">Từ 60 tuổi trở lên</p>
            <div className="mt-auto flex items-center justify-between">
              <span className="text-purple-600 font-bold text-xs">GIẢM 15%</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-blue-100/50 flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-blue-400" />
          <p className="text-[10px] text-blue-400 italic font-medium">(*) Giá vé giảm sẽ được tính chính xác sau khi nhập thông tin hành khách ở bước tiếp theo.</p>
        </div>
      </div>
    </div>
  );
}

function LegendCarriage({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-[40px] h-[20px] rounded-[3px] flex justify-evenly items-center px-0.5" style={{ backgroundColor: color }}>
        <div className="w-2 h-2 bg-white rounded-[2px] opacity-90"></div>
        <div className="w-2 h-2 bg-white rounded-[2px] opacity-90"></div>
        <div className="w-2 h-2 bg-white rounded-[2px] opacity-90"></div>
        <div className="absolute -bottom-1 left-1 w-2.5 h-2.5 bg-white rounded-full border-2" style={{ borderColor: color }}></div>
        <div className="absolute -bottom-1 right-1 w-2.5 h-2.5 bg-white rounded-full border-2" style={{ borderColor: color }}></div>
      </div>
      <span className="text-xs sm:text-sm font-medium text-gray-700">{label}</span>
    </div>
  )
}

function LegendSeat({ label, overrideColor }: { label: string, overrideColor?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-2">
        {/* Fake seat objects without click handlers to act as icons */}
        <SeatItem seat={{ seatNumber: '' } as any} isSelected={false} onSelect={() => { }} readOnly overrideColor={overrideColor} orientation="left" overrideClass="h-7 sm:h-8" />
        <SeatItem seat={{ seatNumber: '' } as any} isSelected={false} onSelect={() => { }} readOnly overrideColor={overrideColor} orientation="right" overrideClass="h-7 sm:h-8" />
      </div>
      <span className="text-xs sm:text-sm font-medium text-gray-700">{label}</span>
    </div>
  )
}
