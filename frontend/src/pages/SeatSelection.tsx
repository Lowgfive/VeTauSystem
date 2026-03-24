import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { seatService, SeatInfo } from '../services/seat.service';
import { SeatItem } from '../components/SeatItem';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { LucideArmchair, Info, Loader2 } from 'lucide-react';
import { CountdownDisplay } from '../components/CountdownDisplay';
import { useCartStore } from '../store/cartStore';
import { toast } from 'sonner';
import { connectSocket, getSocket, joinTrainRoom, leaveTrainRoom } from '../config/socket';
import { useAppSelector } from '../hooks/useRedux';
import { changeBookingSchedule } from '../services/booking.service';

type SeatSocketEvent = {
  trainId: string;
  seatId: string;
  seatNumber: string;
  depOrder?: number;
  arrOrder?: number;
};

type PassengerManifestItem = {
  fullName?: string;
  name?: string;
  age?: number;
  dateOfBirth?: string;
  passengerType?: string;
};

const normalizeRange = (start: number, end: number) => ({
  start: Math.min(start, end),
  end: Math.max(start, end),
});

const rangesOverlap = (startA?: number, endA?: number, startB?: number, endB?: number) => {
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
  const passengerManifest = useMemo<PassengerManifestItem[]>(() => {
    const state = location.state as
      | {
          passengers?: PassengerManifestItem[];
          passengerList?: PassengerManifestItem[];
        }
      | undefined;

    if (Array.isArray(state?.passengers)) return state.passengers;
    if (Array.isArray(state?.passengerList)) return state.passengerList;
    return [];
  }, [location.state]);

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
  const selectedSeatsRef = useRef<SeatInfo[]>([]);
  const recentlyUnlockedSeatsRef = useRef<Map<string, number>>(new Map());
  const preserveLocksOnUnmountRef = useRef(false);

  const RECENT_UNLOCK_WINDOW_MS = 2000;

  useEffect(() => {
    selectedSeatsRef.current = selectedSeats;
  }, [selectedSeats]);

  useEffect(() => {
    return () => {
      if (preserveLocksOnUnmountRef.current || !scheduleId) return;

      selectedSeatsRef.current.forEach((seat) => {
        void seatService.unlockSeat(scheduleId, seat.seatId).catch(() => {});
      });
    };
  }, [scheduleId]);

  useEffect(() => {
    if (!scheduleId) return;

    const fetchSeats = async () => {
      try {
        setLoading(true);
        const response = await seatService.getSeatsBySchedule(scheduleId, departureStationId, arrivalStationId);
        if (response.success) {
          setTrainId(response.data.trainId || scheduleTrainId || '');
          setJourneyRange({
            depOrder: response.data.depOrder ?? schedule?.origin?.station_order,
            arrOrder: response.data.arrOrder ?? schedule?.destination?.station_order,
          });
          setSeats(response.data.seats);
        }
      } catch (error: any) {
        toast.error(`Không thể tải sơ đồ ghế: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchSeats();
  }, [scheduleId, departureStationId, arrivalStationId, scheduleTrainId, schedule?.destination?.station_order, schedule?.origin?.station_order]);

  useEffect(() => {
    if (!trainId || !scheduleId) return;

    connectSocket();
    joinTrainRoom(trainId);
    const socket = getSocket();

    const shouldApplySeatEvent = (data: SeatSocketEvent) =>
      data.trainId === trainId &&
      rangesOverlap(journeyRange.depOrder, journeyRange.arrOrder, data.depOrder, data.arrOrder);

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
        const response = await seatService.getSeatsBySchedule(scheduleId, departureStationId, arrivalStationId);
        if (response.success) {
          setJourneyRange({
            depOrder: response.data.depOrder ?? journeyRange.depOrder,
            arrOrder: response.data.arrOrder ?? journeyRange.arrOrder,
          });
          setSeats(response.data.seats);
          if (selectedSeatsRef.current.some((seat) => seat.seatId === data.seatId)) {
            setSelectedSeats((prev) => prev.filter((seat) => seat.seatId !== data.seatId));
          }
        }
      } catch (error) {
        console.error('Failed to refresh seats after unlock event:', error);
      }
    };

    const handleSeatLocked = (data: SeatSocketEvent) => {
      if (!shouldApplySeatEvent(data)) return;
      if (isRecentlyUnlocked(data.seatId)) return;

      setSeats((prev) =>
        prev.map((seat) => (seat.seatId === data.seatId ? { ...seat, status: 'locked' } : seat))
      );
    };

    const handleSeatBooked = (data: SeatSocketEvent) => {
      if (!shouldApplySeatEvent(data)) return;

      setSeats((prev) =>
        prev.map((seat) => (seat.seatId === data.seatId ? { ...seat, status: 'booked' } : seat))
      );
    };

    socket.on('seat-unlocked', handleSeatUnlocked);
    socket.on('seat-locked', handleSeatLocked);
    socket.on('seat-booked', handleSeatBooked);

    return () => {
      socket.off('seat-unlocked', handleSeatUnlocked);
      socket.off('seat-locked', handleSeatLocked);
      socket.off('seat-booked', handleSeatBooked);
      leaveTrainRoom(trainId);
    };
  }, [trainId, scheduleId, departureStationId, arrivalStationId, journeyRange.depOrder, journeyRange.arrOrder]);

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

  const passengerPolicySummary = useMemo(() => {
    const getAge = (passenger: PassengerManifestItem) => {
      if (typeof passenger.age === 'number' && !Number.isNaN(passenger.age)) {
        return passenger.age;
      }

      if (passenger.dateOfBirth) {
        const birthDate = new Date(passenger.dateOfBirth);
        if (!Number.isNaN(birthDate.getTime())) {
          const now = new Date();
          let age = now.getFullYear() - birthDate.getFullYear();
          const monthDiff = now.getMonth() - birthDate.getMonth();
          const dayDiff = now.getDate() - birthDate.getDate();
          if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
            age -= 1;
          }
          return age;
        }
      }

      return null;
    };

    const passengers = passengerManifest.map((passenger, index) => {
      const age = getAge(passenger);
      const displayName = passenger.fullName || passenger.name || `Hành khách ${index + 1}`;

      if (age !== null && age < 6) {
        return {
          key: `${displayName}-${index}`,
          displayName,
          age,
          seatRequired: false,
          badgeLabel: 'Miễn vé',
          badgeClass: 'bg-green-100 text-green-700',
          note: `Trẻ ${age} tuổi ngồi chung ghế người lớn, không cần chọn ghế riêng`,
          kind: 'infant' as const,
        };
      }

      if (age !== null && age <= 10) {
        return {
          key: `${displayName}-${index}`,
          displayName,
          age,
          seatRequired: true,
          badgeLabel: 'Cần ghế riêng',
          badgeClass: 'bg-amber-100 text-amber-700',
          note: 'Cần mua vé riêng, giảm 25%',
          kind: 'child' as const,
        };
      }

      return {
        key: `${displayName}-${index}`,
        displayName,
        age,
        seatRequired: true,
        badgeLabel: 'Người lớn',
        badgeClass: 'bg-blue-100 text-blue-700',
        note: null,
        kind: 'adult' as const,
      };
    });

    const childCount = passengers.filter((passenger) => passenger.kind !== 'adult').length;
    const adultCount = passengers.filter((passenger) => passenger.kind === 'adult').length;
    const infantCount = passengers.filter((passenger) => passenger.kind === 'infant').length;

    return {
      hasChildren: childCount > 0,
      passengers,
      seatCountRequired: passengers.filter((passenger) => passenger.seatRequired).length,
      exceedsAdultAllowance: infantCount > adultCount,
    };
  }, [passengerManifest]);

  const handleSeatClick = useCallback(
    async (seat: SeatInfo) => {
      if (!scheduleId) return;

      const isSelected = selectedSeats.find((selectedSeat) => selectedSeat.seatId === seat.seatId);

      if (isSelected) {
        try {
          setProcessingId(seat.seatId);
          recentlyUnlockedSeatsRef.current.set(seat.seatId, Date.now());
          await seatService.unlockSeat(scheduleId, seat.seatId);
          setSelectedSeats((prev) => prev.filter((selectedSeat) => selectedSeat.seatId !== seat.seatId));
          toast.success(`Đã bỏ chọn ghế ${seat.seatNumber}`);
        } catch (error: any) {
          recentlyUnlockedSeatsRef.current.delete(seat.seatId);
          toast.error(`Lỗi khi bỏ chọn ghế: ${error.message}`);
        } finally {
          setProcessingId(null);
        }
        return;
      }

      try {
        setProcessingId(seat.seatId);
        if (!isAuthenticated) {
          toast.info('Vui lòng đăng nhập để chọn ghế');
          navigate('/login', { state: { from: location.pathname + location.search } });
          return;
        }

        if (!departureStationId || !arrivalStationId) {
          toast.error('Thiếu thông tin ga đi hoặc ga đến. Vui lòng tìm kiếm lại.');
          return;
        }

        const lockResponse: any = await seatService.lockSeat(
          scheduleId,
          seat.seatId,
          departureStationId,
          arrivalStationId
        );

        if (selectedSeats.length === 0 && lockResponse?.data?.expiresAt) {
          setExpiresAt(lockResponse.data.expiresAt);
        }

        setSelectedSeats((prev) => [...prev, seat]);
        toast.success(`Đã chọn ghế ${seat.seatNumber}`);
      } catch (error: any) {
        if (error.response?.status === 401) {
          toast.error('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
          navigate('/login', { state: { from: location.pathname + location.search } });
        } else {
          toast.error('Ghế này đã có người chọn hoặc đang bị khóa.');
        }
      } finally {
        setProcessingId(null);
      }
    },
    [
      scheduleId,
      selectedSeats,
      isAuthenticated,
      navigate,
      location.pathname,
      location.search,
      departureStationId,
      arrivalStationId,
      setExpiresAt,
    ]
  );

  const changeBookingId = localStorage.getItem('change_booking_id');
  const changeBookingCode = localStorage.getItem('change_booking_code');

  const handleContinue = async () => {
    if (selectedSeats.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một ghế');
      return;
    }

    if (changeBookingId) {
      try {
        setLoading(true);
        const newSeatIds = selectedSeats.map((seat) => seat.seatId);
        await changeBookingSchedule(changeBookingId, {
          new_schedule_id: scheduleId!,
          new_seat_ids: newSeatIds,
        });

        localStorage.removeItem('change_booking_id');
        localStorage.removeItem('change_booking_code');

        toast.success(`Đã đổi vé ${changeBookingCode} thành công!`);
        navigate('/manage');
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Lỗi khi đổi vé');
      } finally {
        setLoading(false);
      }
      return;
    }

    preserveLocksOnUnmountRef.current = true;
    navigate(`/booking/passenger-info/${scheduleId}`, {
      state: {
        ...location.state,
        selectedSeats,
        schedule,
        scheduleId,
      },
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {changeBookingId && (
        <div className="mb-6 flex items-center justify-between rounded-xl bg-blue-600 p-4 text-white shadow-lg animate-in slide-in-from-top duration-500">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
              <LucideArmchair className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Đang đổi lịch cho vé {changeBookingCode}</h2>
              <p className="text-sm text-blue-100">Vui lòng chọn chỗ mới cho chuyến đi này.</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="text-white hover:bg-white/10"
            onClick={() => {
              localStorage.removeItem('change_booking_id');
              localStorage.removeItem('change_booking_code');
              window.location.reload();
            }}
          >
            Hủy đổi vé
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="flex-1">
          <Card>
            <CardHeader className="border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                  <LucideArmchair className="text-primary" />
                  Sơ đồ chọn ghế
                </CardTitle>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <div className="h-4 w-4 rounded border border-green-300 bg-green-100"></div>
                    <span>Trống</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-4 w-4 rounded border border-red-200 bg-red-100"></div>
                    <span>Đã đặt</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-4 w-4 rounded border border-yellow-200 bg-yellow-100"></div>
                    <span>Đang giữ</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-4 w-4 rounded bg-blue-500"></div>
                    <span>Bạn chọn</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {Object.keys(seatsByCarriage).length === 0 ? (
                <div className="py-20 text-center text-muted-foreground">
                  <Info className="mx-auto mb-2 opacity-20" size={48} />
                  <p>Không tìm thấy thông tin ghế cho chuyến đi này.</p>
                </div>
              ) : (
                Object.entries(seatsByCarriage).map(([carriageId, carriageSeats], index) => (
                  <div key={carriageId} className="mb-10 last:mb-0">
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">Toa {index + 1}</span>
                      <span className="text-sm font-normal text-muted-foreground">({carriageSeats[0].seatType})</span>
                    </h3>
                    <div className="grid grid-cols-4 gap-2 rounded-xl border border-dashed bg-muted/30 p-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
                      {carriageSeats.map((seat) => (
                        <SeatItem
                          key={seat.seatId}
                          seat={seat}
                          isSelected={selectedSeats.some((selectedSeat) => selectedSeat.seatId === seat.seatId)}
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

        <div className="w-full lg:w-80">
          <Card className="sticky top-24">
            <CardHeader className="flex flex-row items-center justify-between bg-muted/50 py-4">
              <CardTitle className="text-lg">Tóm tắt lựa chọn</CardTitle>
              {selectedSeats.length > 0 && (
                <CountdownDisplay
                  expiresAt={expiresAt}
                  onExpire={async () => {
                    const expiredSeats = selectedSeatsRef.current;

                    try {
                      await Promise.all(
                        expiredSeats.map((seat) => seatService.unlockSeat(scheduleId!, seat.seatId))
                      );
                    } catch (error) {
                      console.error('Failed to unlock expired seats:', error);
                    } finally {
                      setSelectedSeats([]);
                      clearExpiresAt();
                      toast.error('Đã hết thời gian giữ chỗ. Vui lòng chọn lại.');
                    }
                  }}
                />
              )}
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {passengerPolicySummary.hasChildren && (
                  <>
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                      <div className="mb-2 text-sm font-semibold text-blue-700">Chính sách vé trẻ em</div>
                      <p className="text-xs leading-5 text-blue-800">
                        Trẻ dưới 6 tuổi miễn vé, ngồi chung ghế người lớn. Mỗi người lớn chỉ kèm 1 trẻ miễn vé.
                        Trẻ từ 6-10 tuổi cần mua vé riêng và được giảm 25%.
                      </p>
                      <p className="mt-2 text-[11px] font-medium text-red-600">
                        Vui lòng chọn đúng số ghế cần thiết theo danh sách hành khách.
                      </p>
                      {passengerPolicySummary.exceedsAdultAllowance && (
                        <p className="mt-2 text-[11px] font-medium text-red-600">
                          Số trẻ miễn vé hiện vượt quá số người lớn đi kèm.
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Danh sách hành khách</p>
                      <div className="space-y-2">
                        {passengerPolicySummary.passengers.map((passenger) => (
                          <div key={passenger.key} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-medium text-slate-700">
                                {passenger.displayName}
                                {passenger.age !== null ? ` (${passenger.age} tuổi)` : ''}
                              </span>
                              <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${passenger.badgeClass}`}>
                                {passenger.badgeLabel}
                              </span>
                            </div>
                            {passenger.note && <p className="mt-1 text-[11px] text-slate-600">{passenger.note}</p>}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-slate-100 px-3 py-2 text-sm">
                      <span>Số ghế cần chọn:</span>
                      <strong className="text-blue-700">{passengerPolicySummary.seatCountRequired} ghế</strong>
                    </div>
                  </>
                )}

                <div className="flex items-center justify-between text-sm">
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
                          className="rounded border border-blue-200 bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700"
                        >
                          {seat.seatNumber}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm italic text-muted-foreground">Vui lòng chọn ghế trên sơ đồ</p>
                )}

                <div className="border-t pt-4">
                  <div className="flex items-start gap-2 rounded-md border border-blue-100 bg-blue-50 p-3 text-xs text-muted-foreground">
                    <Info size={14} className="mt-0.5 text-blue-500" />
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
                {loading ? <Loader2 className="mr-2 animate-spin" /> : null}
                {changeBookingId ? 'Xác nhận đổi vé' : 'Tiếp tục đặt vé'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
