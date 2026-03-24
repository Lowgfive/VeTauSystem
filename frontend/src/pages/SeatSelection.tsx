import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { seatService, SeatInfo } from "../services/seat.service";
import { SeatItem } from "../components/SeatItem";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../components/ui/card";
import { 
  LucideArmchair, Info, Loader2 
} from "lucide-react";
import { CountdownDisplay } from "../components/CountdownDisplay";
import { useCartStore } from "../store/cartStore";
import { toast } from "sonner";
import { getSocket, connectSocket, joinTrainRoom, leaveTrainRoom } from '../config/socket';
import { useAppSelector } from "../hooks/useRedux";
import { changeBookingSchedule } from "../services/booking.service";
import { Booking } from "../types";

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

const SeatSelection: React.FC = () => {
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const schedule = location.state?.schedule;
  const departureStationId = schedule?.origin?.id;
  const arrivalStationId = schedule?.destination?.id;
  const scheduleTrainId = schedule?.trainId || schedule?.train?._id;

  const [seats, setSeats] = useState<SeatInfo[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<SeatInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [trainId, setTrainId] = useState<string>(scheduleTrainId || '');
  const [journeyRange, setJourneyRange] = useState<{ depOrder?: number; arrOrder?: number }>({
    depOrder: schedule?.origin?.station_order,
    arrOrder: schedule?.destination?.station_order,
  });

  const setExpiresAt = useCartStore((state) => state.setExpiresAt);
  const expiresAt = useCartStore((state) => state.expiresAt);
  const clearExpiresAt = useCartStore((state) => state.clearExpiresAt);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // 1. Root Cause Fix: Use useRef to track selectedSeats without triggering re-effects
  const selectedSeatsRef = useRef<SeatInfo[]>([]);

  // Keep ref in sync with state
  useEffect(() => {
    selectedSeatsRef.current = selectedSeats;
  }, [selectedSeats]);

  // 2. Fetch data: Only run when scheduleId changes
  useEffect(() => {
    if (!scheduleId) return;

    const fetchSeats = async () => {
      try {
        setLoading(true);
        const response = await seatService.getSeatsBySchedule(
          scheduleId,
          departureStationId,
          arrivalStationId
        );
        if (response.success) {
          setTrainId(response.data.trainId || scheduleTrainId || "");
          setJourneyRange({
            depOrder: response.data.depOrder ?? schedule?.origin?.station_order,
            arrOrder: response.data.arrOrder ?? schedule?.destination?.station_order,
          });
          setSeats(response.data.seats);
        }
      } catch (error: any) {
        toast.error("Không thể tải sơ đồ ghế: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSeats();
  }, [scheduleId, departureStationId, arrivalStationId, scheduleTrainId]);

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

    const handleSeatUnlocked = async (data: SeatSocketEvent) => {
      if (!shouldApplySeatEvent(data)) return;

      try {
        const response = await seatService.getSeatsBySchedule(
          scheduleId!,
          departureStationId,
          arrivalStationId
        );
        if (response.success) {
          setJourneyRange({
            depOrder: response.data.depOrder ?? journeyRange.depOrder,
            arrOrder: response.data.arrOrder ?? journeyRange.arrOrder,
          });
          setSeats(response.data.seats);
        }
      } catch (error) {
        console.error("Failed to refresh seats after unlock event:", error);
      }
    };

    const handleSeatLocked = (data: SeatSocketEvent) => {
      if (!shouldApplySeatEvent(data)) return;

      setSeats(prev => prev.map(seat => 
         seat.seatId === data.seatId 
           ? { ...seat, status: "locked" } 
           : seat
      ));
    };

    const handleSeatBooked = (data: SeatSocketEvent) => {
      if (!shouldApplySeatEvent(data)) return;

      setSeats(prev => prev.map(seat => 
         seat.seatId === data.seatId 
           ? { ...seat, status: "booked" } 
           : seat
      ));
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
  }, [trainId, scheduleId, departureStationId, arrivalStationId, journeyRange.depOrder, journeyRange.arrOrder]);

  // Removed Cleanup: UNLOCK ONLY ON UNMOUNT 
  // Per requirements: Do NOT unlock seats when user navigates away or refreshes the page


  // Group seats by carriageId using useMemo for performance
  const seatsByCarriage = useMemo(() => {
    const groups: Record<string, SeatInfo[]> = {};
    seats.forEach((seat) => {
      if (!groups[seat.carriageId]) {
        groups[seat.carriageId] = [];
      }
      groups[seat.carriageId].push(seat);
    });
    return groups;
  }, [seats]);

  const handleSeatClick = useCallback(async (seat: SeatInfo) => {
    if (!scheduleId) return;

    const isSelected = selectedSeats.find((s) => s.seatId === seat.seatId);

    if (isSelected) {
      // Manual unlock via user click
      try {
        setProcessingId(seat.seatId);
        await seatService.unlockSeat(scheduleId, seat.seatId);
        setSelectedSeats((prev) => prev.filter((s) => s.seatId !== seat.seatId));
        toast.success(`Đã bỏ chọn ghế ${seat.seatNumber}`);
      } catch (error: any) {
        toast.error("Lỗi khi bỏ chọn ghế: " + error.message);
      } finally {
        setProcessingId(null);
      }
    } else {
        // Manual lock via user click
      try {
        setProcessingId(seat.seatId);
        if (!isAuthenticated) {
          toast.info("Vui lòng đăng nhập để chọn ghế");
          navigate("/login", { state: { from: location.pathname + location.search } });
          return;
        }
        if (!departureStationId || !arrivalStationId) {
            toast.error("Thiếu thông tin ga đi hoặc ga đến. Vui lòng tìm kiếm lại.");
            return;
        }
        const lockRes: any = await seatService.lockSeat(
          scheduleId,
          seat.seatId,
          departureStationId,
          arrivalStationId
        );

        // If this is the FIRST seat locked, set the global expiration timer
        if (selectedSeats.length === 0 && lockRes?.data?.expiresAt) {
          setExpiresAt(lockRes.data.expiresAt);
        }

        setSelectedSeats((prev) => [...prev, seat]);
        toast.success(`Đã chọn ghế ${seat.seatNumber}`);
      } catch (error: any) {
        if (error.response?.status === 401) {
          toast.error("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.");
          navigate("/login", { state: { from: location.pathname + location.search } });
        } else {
          toast.error("Ghế này đã có người chọn hoặc đang bị khóa.");
        }
      } finally {
        setProcessingId(null);
      }
    }
  }, [scheduleId, selectedSeats, isAuthenticated, navigate, location.pathname, location.search, departureStationId, arrivalStationId, setExpiresAt]);

  const changeBookingId = localStorage.getItem("change_booking_id");
  const changeBookingCode = localStorage.getItem("change_booking_code");

  const handleContinue = async () => {
    if (selectedSeats.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một ghế");
      return;
    }

    if (changeBookingId) {
      // HANDLE CHANGE BOOKING
      try {
        setLoading(true);
        const newSeatIds = selectedSeats.map(s => s.seatId);
        await changeBookingSchedule(changeBookingId, {
           new_schedule_id: scheduleId!,
           new_seat_ids: newSeatIds
        });
        
        // Clean up
        localStorage.removeItem("change_booking_id");
        localStorage.removeItem("change_booking_code");
        
        toast.success(`Đã đổi vé ${changeBookingCode} thành công!`);
        navigate("/manage"); // Go back to bookings
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Lỗi khi đổi vé");
      } finally {
        setLoading(false);
      }
      return;
    }

    // NORMAL FLOW
    navigate(`/booking/passenger-info/${scheduleId}`, { state: { selectedSeats, schedule, scheduleId } });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {changeBookingId && (
        <div className="mb-6 p-4 bg-blue-600 text-white rounded-xl shadow-lg flex items-center justify-between animate-in slide-in-from-top duration-500">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                 <LucideArmchair className="w-6 h-6" />
              </div>
              <div>
                 <h2 className="text-lg font-bold">Đang đổi lịch cho vé {changeBookingCode}</h2>
                 <p className="text-blue-100 text-sm">Vui lòng chọn chỗ mới cho chuyến đi này.</p>
              </div>
           </div>
           <Button 
            variant="ghost" 
            className="text-white hover:bg-white/10"
            onClick={() => {
              localStorage.removeItem("change_booking_id");
              localStorage.removeItem("change_booking_code");
              window.location.reload();
            }}
           >
              Hủy đổi vé
           </Button>
        </div>
      )}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Seat Map */}
        <div className="flex-1">
          <Card>
            <CardHeader className="border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <LucideArmchair className="text-primary" />
                  Sơ đồ chọn ghế
                </CardTitle>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                    <span>Trống</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
                    <span>Đã đặt</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded"></div>
                    <span>Đang giữ</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span>Bạn chọn</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {Object.keys(seatsByCarriage).length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                  <Info className="mx-auto mb-2 opacity-20" size={48} />
                  <p>Không tìm thấy thông tin ghế cho chuyến đi này.</p>
                </div>
              ) : (
                Object.entries(seatsByCarriage).map(([carriageId, carriageSeats], index) => (
                  <div key={carriageId} className="mb-10 last:mb-0">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                        Toa {index + 1}
                      </span>
                      <span className="text-muted-foreground text-sm font-normal">
                        ({carriageSeats[0].seatType})
                      </span>
                    </h3>
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 p-4 bg-muted/30 rounded-xl border border-dashed">
                      {carriageSeats.map((seat) => (
                        <SeatItem
                          key={seat.seatId}
                          seat={seat}
                          isSelected={selectedSeats.some((s) => s.seatId === seat.seatId)}
                          onSelect={handleSeatClick}
                          isLoading={processingId === seat.seatId}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="w-full lg:w-80">
          <Card className="sticky top-24">
            <CardHeader className="bg-muted/50 flex flex-row items-center justify-between py-4">
              <CardTitle className="text-lg">Tóm tắt lựa chọn</CardTitle>
              {selectedSeats.length > 0 && <CountdownDisplay expiresAt={expiresAt} onExpire={() => {
                setSelectedSeats([]);
                toast.error("Đã hết thời gian giữ chỗ. Vui lòng chọn lại.");
              }} />}
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Số lượng ghế:</span>
                  <span className="font-bold">{selectedSeats.length}</span>
                </div>

                {selectedSeats.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Ghế đã chọn:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedSeats.map((seat) => (
                        <span
                          key={seat.seatId}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded border border-blue-200"
                        >
                          {seat.seatNumber}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Vui lòng chọn ghế trên sơ đồ</p>
                )}

                <div className="pt-4 border-t">
                  <div className="flex items-start gap-2 text-xs text-muted-foreground bg-blue-50 p-3 rounded-md border border-blue-100">
                    <Info size={14} className="text-blue-500 mt-0.5" />
                    <p>Ghế sẽ được giữ trong vòng 5 phút để bạn hoàn tất thông tin.</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 pt-6">
              <Button
                onClick={handleContinue}
                className={`w-full ${changeBookingId ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                size="lg"
                disabled={selectedSeats.length === 0 || loading}
              >
                {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                {changeBookingId ? "Xác nhận đổi vé" : "Tiếp tục đặt vé"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
