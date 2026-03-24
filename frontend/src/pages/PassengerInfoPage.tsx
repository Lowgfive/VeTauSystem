import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { PassengerForm } from '../components/PassengerForm';
import { Passenger } from '../types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Shield, ArrowLeft, Users, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../config/api';
import { CountdownDisplay } from '../components/CountdownDisplay';
import { calculateSeatPrice } from '../utils/pricing';
import {
  calculatePassengerFare,
  getPassengerDobError,
  getPassengerDiscountRate,
} from '../utils/passengerRules';

export default function PassengerInfoPage() {
  const { scheduleId } = useParams<{ scheduleId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const { selectedSeats = [], schedule, outboundState } = location.state || {};

  const isRoundTrip = !!outboundState;
  const outboundSchedule = isRoundTrip ? outboundState.schedule : schedule;
  const outboundSeats = isRoundTrip ? outboundState.selectedSeats : selectedSeats;

  const returnSchedule = isRoundTrip ? schedule : null;
  const returnSeats = isRoundTrip ? selectedSeats : [];

  const [passengers, setPassengers] = useState<Passenger[]>([]);

  const handlePassengerUpdate = (index: number, passenger: Passenger) => {
    setPassengers((prev) => {
      const updated = [...prev];
      updated[index] = passenger;
      return updated;
    });
  };

  const handleRemoveSeat = async (seatId: string, currentScheduleId: string) => {
    let unlockFailed = false;

    try {
      const response = await apiClient.delete(`/seats/unlock/${seatId}`);

      if (!response.data || !response.data.success) {
        unlockFailed = true;
      }
    } catch (error) {
      unlockFailed = true;
    }

    let updatedOutbound = [...outboundSeats];
    let updatedReturn = [...returnSeats];

    const isOutboundSeat = outboundSeats.some((s: any) => s.seatId === seatId);

    if (isOutboundSeat) {
      updatedOutbound = outboundSeats.filter((s: any) => s.seatId !== seatId);
      sessionStorage.setItem(`selectedSeats_${outboundSchedule?.id}`, JSON.stringify(updatedOutbound));
    } else {
      updatedReturn = returnSeats.filter((s: any) => s.seatId !== seatId);
      sessionStorage.setItem(`selectedSeats_${returnSchedule?.id}`, JSON.stringify(updatedReturn));
    }

    const seatIndex = isOutboundSeat
      ? outboundSeats.findIndex((s: any) => s.seatId === seatId)
      : returnSeats.findIndex((s: any) => s.seatId === seatId);

    if (seatIndex !== -1) {
      setPassengers((prev) => {
        const updated = [...prev];
        updated.splice(seatIndex, 1);
        return updated;
      });
    }

    if (updatedOutbound.length === 0 || (isRoundTrip && updatedReturn.length === 0)) {
      if (unlockFailed) {
        toast.error('Ghế đã được gỡ khỏi màn hình nhưng chưa xác nhận nhả trên hệ thống.');
      } else {
        toast.success('Đã xóa vé cuối cùng ở một chiều, trở về trang chọn ghế!');
      }
      navigate(-1);
    } else {
      if (unlockFailed) {
        toast.error('Không thể xác nhận nhả ghế trên hệ thống. Ghế vẫn được gỡ khỏi màn hình của bạn.');
      } else {
        toast.success('Xóa vé thành công!');
      }
      if (isRoundTrip) {
        navigate(location.pathname, {
          state: {
            ...location.state,
            selectedSeats: updatedReturn,
            outboundState: { schedule: outboundSchedule, selectedSeats: updatedOutbound },
          },
          replace: true,
        });
      } else {
        navigate(location.pathname, {
          state: { ...location.state, selectedSeats: updatedOutbound },
          replace: true,
        });
      }
    }
  };

  const isFormValid =
    outboundSeats.length > 0 &&
    outboundSeats.every((_: any, index: number) => {
      const passenger = passengers[index];

      if (!passenger || !passenger.fullName || !passenger.idNumber || !passenger.passengerType) {
        return false;
      }

      if (index === 0 && !passenger.phone) {
        return false;
      }

      if (
        (passenger.passengerType === 'Trẻ em' || passenger.passengerType === 'Người cao tuổi') &&
        !passenger.dateOfBirth
      ) {
        return false;
      }

      const dobError = getPassengerDobError(passenger.passengerType, passenger.dateOfBirth);
      if (dobError) {
        return false;
      }

      return true;
    });

  const basePriceOutbound = outboundSchedule?.basePrice || outboundSchedule?.price || 0;
  const basePriceReturn = returnSchedule?.basePrice || returnSchedule?.price || 0;
  const insuranceFee = 1000;

  const calculateFare = (passenger: Passenger | undefined, basePrice: number, seatType: string) => {
    const adjustedBasePrice = calculateSeatPrice(basePrice, seatType);
    if (!passenger) return adjustedBasePrice + insuranceFee;
    return calculatePassengerFare(
      adjustedBasePrice,
      passenger.passengerType,
      insuranceFee,
      passenger.dateOfBirth
    );
  };

  const totalPriceOutbound = useMemo(() => {
    if (passengers.length === 0) {
      return outboundSeats.reduce(
        (sum: number, seat: any) => sum + calculateSeatPrice(basePriceOutbound, seat.seatType) + insuranceFee,
        0
      );
    }

    return passengers.reduce(
      (sum, passenger, index) => sum + calculateFare(passenger, basePriceOutbound, outboundSeats[index]?.seatType),
      0
    );
  }, [passengers, basePriceOutbound, insuranceFee, outboundSeats]);

  const totalPriceReturn = useMemo(() => {
    if (!isRoundTrip) return 0;

    if (passengers.length === 0) {
      return returnSeats.reduce(
        (sum: number, seat: any) => sum + calculateSeatPrice(basePriceReturn, seat.seatType) + insuranceFee,
        0
      );
    }

    return passengers.reduce(
      (sum, passenger, index) => sum + calculateFare(passenger, basePriceReturn, returnSeats[index]?.seatType),
      0
    );
  }, [passengers, basePriceReturn, insuranceFee, returnSeats, isRoundTrip]);

  const handleContinue = () => {
    if (!isFormValid) {
      toast.error('Vui lòng điền đủ thông tin hợp lệ cho tất cả hành khách.');
      return;
    }

    const buildBookingData = (sch: any, seats: any[], tripTotalPrice: number) => {
      const rawDepartureTime = sch?.departureTime || sch?.departure_time || sch?.depart_time || 'N/A';
      const rawArrivalTime = sch?.arrivalTime || sch?.arrival_time || sch?.arrive_time || 'N/A';

      const rawDate = sch?.date || sch?.departureDate || null;
      const parsedDate = rawDate ? new Date(rawDate) : null;
      const isValidDate = (date: Date | null) => date instanceof Date && !isNaN(date.getTime());

      return {
        trainCode: sch?.train?.train_code || sch?.trainCode || 'Tàu',
        trainName: sch?.train?.train_name || sch?.trainName || 'Chuyến tàu',
        route: {
          origin: sch?.origin?.station_name || sch?.departureStation || 'Ga đi',
          destination: sch?.destination?.station_name || sch?.arrivalStation || 'Ga đến',
        },
        date: isValidDate(parsedDate) ? parsedDate!.toISOString() : '',
        departureTime: rawDepartureTime,
        arrivalTime: rawArrivalTime,
        duration: sch?.duration || 'N/A',
        seats: seats.map((seat: any, index: number) => {
          const passenger = passengers[index];

          return {
            seat_id: seat.seatId,
            seat_number: seat.seatNumber || seat.seat_number || seat.seatId,
            full_name: passenger?.fullName || '',
            id_number: passenger?.idNumber || '',
            dob: passenger?.dateOfBirth,
            gender: 'Unknown',
            passenger_type: passenger?.passengerType || 'Người lớn',
            ticket_price: calculateFare(passenger, sch?.basePrice || sch?.price || 0, seat.seatType),
            base_price: sch?.basePrice || sch?.price || 0,
            insurance: insuranceFee,
            discount_rate: passenger
              ? getPassengerDiscountRate(passenger.passengerType, passenger.dateOfBirth)
              : 0,
          };
        }),
        passengers: passengers.map((passenger) => ({
          name: passenger.fullName,
          id: passenger.idNumber,
          phone: passenger.phone,
          dob: passenger.dateOfBirth,
          type: passenger.passengerType,
        })),
        totalPrice: tripTotalPrice,
        scheduleId: sch?.id || sch?._id,
        departureStationId: sch?.origin?.id,
        arrivalStationId: sch?.destination?.id,
      };
    };

    const bookingDataOutbound = buildBookingData(outboundSchedule, outboundSeats, totalPriceOutbound);
    const bookingDataReturn = isRoundTrip ? buildBookingData(returnSchedule, returnSeats, totalPriceReturn) : null;
    const bookingData = isRoundTrip ? [bookingDataOutbound, bookingDataReturn] : bookingDataOutbound;

    navigate('/checkout', { state: { bookingData } });
  };

  if (!outboundSchedule || outboundSeats.length === 0) {
    return (
      <div className="container mx-auto p-12 text-center">
        <h2 className="text-xl font-bold">Không tìm thấy thông tin đặt chỗ</h2>
        <Button onClick={() => navigate(-1)} className="mt-4">
          Quay lại
        </Button>
      </div>
    );
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center font-medium text-blue-600 hover:underline">
        <ArrowLeft size={18} className="mr-1" /> Quay lại chọn ghế
      </button>

      <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold">
        <Users className="text-primary" /> Thông tin hành khách
      </h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {outboundSeats.map((seat: any, index: number) => (
            <PassengerForm
              key={`pform-${index}`}
              passengerNumber={index + 1}
              seatNumber={
                isRoundTrip
                  ? `${seat.seatNumber} (đi) - ${returnSeats[index]?.seatNumber || ''} (về)`
                  : seat.seatNumber
              }
              seatId={seat.seatId}
              basePrice={calculateSeatPrice(basePriceOutbound, seat.seatType)}
              insuranceFee={insuranceFee}
              isContactPerson={index === 0}
              onPassengerUpdate={(passenger) => handlePassengerUpdate(index, passenger)}
              onRemoveSeat={() => handleRemoveSeat(seat.seatId, outboundSchedule.id)}
            />
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24 border-primary/20 shadow-lg">
            <CardHeader className="flex flex-col gap-3 bg-primary/5 pb-4">
              <CardTitle className="text-lg">Tóm tắt chuyến đi</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[60vh] space-y-4 overflow-y-auto pt-6">
              <div className="mb-4">
                {isRoundTrip && <h4 className="mb-2 border-b pb-2 font-bold text-gray-800">Chiều đi</h4>}
                <div>
                  <p className="text-sm text-slate-500">Chuyến tàu</p>
                  <p className="font-bold">
                    {outboundSchedule?.train?.train_code} - {outboundSchedule?.train?.train_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Lộ trình</p>
                  <p className="font-semibold">
                    {outboundSchedule?.origin?.station_name} → {outboundSchedule?.destination?.station_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Ghế đã chọn</p>
                  <div className="mt-2 flex flex-col gap-2">
                    {outboundSeats.map((seat: any) => (
                      <div
                        key={seat.seatId}
                        className="flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50/50 p-2"
                      >
                        <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
                          {seat.seatNumber}
                        </span>
                        {seat.expiresAt && (
                          <CountdownDisplay
                            expiresAt={seat.expiresAt}
                            className="px-2 py-1 text-[10px]"
                            onExpire={() => {
                              toast.error(`Ghế ${seat.seatNumber} đã hết thời gian giữ chỗ!`);
                              handleRemoveSeat(seat.seatId, outboundSchedule.id);
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {isRoundTrip && (
                <div className="mb-4 border-t border-dashed border-gray-300 pt-4">
                  <h4 className="mb-2 border-b pb-2 font-bold text-gray-800">Chiều về</h4>
                  <div>
                    <p className="text-sm text-slate-500">Chuyến tàu</p>
                    <p className="font-bold">
                      {returnSchedule?.train?.train_code} - {returnSchedule?.train?.train_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Lộ trình</p>
                    <p className="font-semibold">
                      {returnSchedule?.origin?.station_name} → {returnSchedule?.destination?.station_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Ghế đã chọn</p>
                    <div className="mt-2 flex flex-col gap-2">
                      {returnSeats.map((seat: any) => (
                        <div
                          key={seat.seatId}
                          className="flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50/50 p-2"
                        >
                          <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
                            {seat.seatNumber}
                          </span>
                          {seat.expiresAt && (
                            <CountdownDisplay
                              expiresAt={seat.expiresAt}
                              className="px-2 py-1 text-[10px]"
                              onExpire={() => {
                                toast.error(`Ghế ${seat.seatNumber} đã hết thời gian giữ chỗ!`);
                                handleRemoveSeat(seat.seatId, returnSchedule.id);
                              }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng tiền</span>
                  <span className="text-blue-600">{formatPrice(totalPriceOutbound + totalPriceReturn)}</span>
                </div>
              </div>
              {!isFormValid && (
                <p className="mt-2 text-center text-xs text-red-500">
                  Vui lòng điền đủ thông tin hành khách để tiếp tục
                </p>
              )}
            </CardContent>
            <CardFooter>
              <Button
                className="h-12 w-full bg-blue-600 text-lg hover:bg-blue-700"
                onClick={handleContinue}
                disabled={!isFormValid || outboundSeats.length === 0 || (isRoundTrip && returnSeats.length === 0)}
              >
                <CreditCard size={20} /> Thanh toán
              </Button>
            </CardFooter>
          </Card>

          <div className="mt-4 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            <Shield size={16} className="mt-0.5 shrink-0" />
            <p>Thông tin của bạn được bảo mật tuyệt đối và chỉ dùng để xuất vé.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
