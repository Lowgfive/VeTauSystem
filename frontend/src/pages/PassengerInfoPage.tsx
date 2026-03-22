import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { PassengerForm } from '../components/PassengerForm';
import { Passenger } from '../types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Shield, ArrowLeft, Users, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../config/api';
import { CountdownDisplay } from '../components/CountdownDisplay';
import { calculateSeatPrice } from '../utils/pricing';

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
  
  // Array of passengers
  const [passengers, setPassengers] = useState<Passenger[]>([]);

  const handlePassengerUpdate = (index: number, passenger: Passenger) => {
    setPassengers(prev => {
      const updated = [...prev];
      updated[index] = passenger;
      return updated;
    });
  };

  const handleRemoveSeat = async (seatId: string, currentScheduleId: string) => {
    try {
      // 1. Gọi API DELETE để unlock ghế
      const response = await apiClient.delete(`/seats/unlock/${seatId}`);
      
      if (!response.data || !response.data.success) {
        throw new Error("Không thể xóa vé");
      }
      
      let updatedOutbound = [...outboundSeats];
      let updatedReturn = [...returnSeats];

      const isOutboundSeat = outboundSeats.some((s:any) => s.seatId === seatId);

      if (isOutboundSeat) {
          updatedOutbound = outboundSeats.filter((s: any) => s.seatId !== seatId);
          sessionStorage.setItem(`selectedSeats_${outboundSchedule?.id}`, JSON.stringify(updatedOutbound));
      } else {
          updatedReturn = returnSeats.filter((s: any) => s.seatId !== seatId);
          sessionStorage.setItem(`selectedSeats_${returnSchedule?.id}`, JSON.stringify(updatedReturn));
      }

      // Update the passengers array to remove the corresponding passenger info
      // Always remove based on index match
      const seatIndex = isOutboundSeat 
           ? outboundSeats.findIndex((s: any) => s.seatId === seatId)
           : returnSeats.findIndex((s: any) => s.seatId === seatId);

      if (seatIndex !== -1) {
          setPassengers(prev => {
              const updated = [...prev];
              updated.splice(seatIndex, 1);
              return updated;
          });
      }

      if (updatedOutbound.length === 0 || (isRoundTrip && updatedReturn.length === 0)) {
        toast.success("Đã xóa vé cuối cùng ở một chiều, trỏ về trang chọn ghế!");
        navigate(-1);
      } else {
        toast.success("Xóa vé thành công!");
        if (isRoundTrip) {
           navigate(location.pathname, { state: { ...location.state, selectedSeats: updatedReturn, outboundState: { schedule: outboundSchedule, selectedSeats: updatedOutbound } }, replace: true });
        } else {
           navigate(location.pathname, { state: { ...location.state, selectedSeats: updatedOutbound }, replace: true });
        }
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi xóa vé. Vui lòng thử lại!");
    }
  };

  const isFormValid = passengers.length === outboundSeats.length && passengers.every(p => {
    if (!p || !p.fullName || !p.idNumber || !p.phone || !p.passengerType) return false;
    if ((p.passengerType === 'Trẻ em' || p.passengerType === 'Người cao tuổi') && !p.dateOfBirth) return false;
    return true;
  });

  const basePriceOutbound = outboundSchedule?.basePrice || outboundSchedule?.price || 0;
  const basePriceReturn = returnSchedule?.basePrice || returnSchedule?.price || 0;
  const insuranceFee = 1000; // Assuming 1000 VND insurance fee as an example

  // Calculate pricing based on passengerType
  const getDiscountRate = (type?: string) => {
    if (type === 'Trẻ em') return 0.25;
    if (type === 'Sinh viên') return 0.1;
    if (type === 'Người cao tuổi') return 0.15;
    return 0;
  };

  const calculateFare = (passenger: Passenger | undefined, baseP: number, seatType: string) => {
    const adjustedBasePrice = calculateSeatPrice(baseP, seatType);
    if (!passenger) return adjustedBasePrice + insuranceFee;
    const discountRate = getDiscountRate(passenger.passengerType);
    return (adjustedBasePrice * (1 - discountRate)) + insuranceFee;
  };

  const totalPriceOutbound = useMemo(() => {
    if (passengers.length === 0) return outboundSeats.reduce((sum: number, s: any) => sum + calculateSeatPrice(basePriceOutbound, s.seatType) + insuranceFee, 0); 
    return passengers.reduce((sum, p, i) => sum + calculateFare(p, basePriceOutbound, outboundSeats[i]?.seatType), 0);
  }, [passengers, basePriceOutbound, insuranceFee, outboundSeats]);

  const totalPriceReturn = useMemo(() => {
    if (!isRoundTrip) return 0;
    if (passengers.length === 0) return returnSeats.reduce((sum: number, s: any) => sum + calculateSeatPrice(basePriceReturn, s.seatType) + insuranceFee, 0); 
    return passengers.reduce((sum, p, i) => sum + calculateFare(p, basePriceReturn, returnSeats[i]?.seatType), 0);
  }, [passengers, basePriceReturn, insuranceFee, returnSeats, isRoundTrip]);

  const handleContinue = () => {
    if (!isFormValid) {
      toast.error('Vui lòng điền đủ thông tin hợp lệ cho tất cả hành khách.');
      return;
    }

    // Now format data for Payment page


    const buildBookingData = (sch: any, sts: any[], tripTotalPrice: number) => {
      // Normalize departure time - backend uses different field names
      const rawDepartureTime = sch?.departureTime || sch?.departure_time || sch?.depart_time || "N/A";
      const rawArrivalTime   = sch?.arrivalTime   || sch?.arrival_time   || sch?.arrive_time || "N/A";
      
      const rawDate = sch?.date || sch?.departureDate || null;
      const parsedDate = rawDate ? new Date(rawDate) : null;
      const isValidDate = (d: Date | null) => d instanceof Date && !isNaN(d.getTime());

      return {
        trainCode: sch?.train?.train_code || sch?.trainCode || "Tàu",
        trainName: sch?.train?.train_name || sch?.trainName || "Chuyến tàu",
        route: {
          origin:      sch?.origin?.station_name      || sch?.departureStation || "Ga đi",
          destination: sch?.destination?.station_name || sch?.arrivalStation   || "Ga đến",
        },
        date:          isValidDate(parsedDate) ? parsedDate!.toISOString() : "",
        departureTime: rawDepartureTime,
        arrivalTime:   rawArrivalTime,
        duration: sch?.duration || "N/A",
        seats: sts.map((s: any, index: number) => {
          const p = passengers[index];
          return {
            seat_id:       s.seatId,
            seat_number:   s.seatNumber || s.seat_number || s.seatId,
            full_name:     p?.fullName    || "",
            id_number:     p?.idNumber    || "",
            dob:           p?.dateOfBirth,
            gender:        "Unknown",
            passenger_type: p?.passengerType || "Người lớn",
            ticket_price:  calculateFare(p, sch?.basePrice || sch?.price || 0),
            base_price:    sch?.basePrice || sch?.price || 0,
            insurance:     insuranceFee,
            discount_rate: getDiscountRate(p?.passengerType),
          };
        }),
        passengers: passengers.map((p) => ({
          name:  p.fullName,
          id:    p.idNumber,
          phone: p.phone,
          dob:   p.dateOfBirth,
          type:  p.passengerType,
        })),
        totalPrice:          tripTotalPrice,
        scheduleId:          sch?.id || sch?._id,
        departureStationId:  sch?.origin?.id,
        arrivalStationId:    sch?.destination?.id,
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
        <Button onClick={() => navigate(-1)} className="mt-4">Quay lại</Button>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
       <button onClick={() => navigate(-1)} className="flex items-center text-blue-600 font-medium mb-6 hover:underline">
          <ArrowLeft size={18} className="mr-1" /> Quay lại chọn ghế
       </button>
       
       <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
         <Users className="text-primary" /> Thông tin hành khách
       </h1>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {outboundSeats.map((seat: any, index: number) => (
              <PassengerForm
                key={`pform-${index}`}
                passengerNumber={index + 1}
                seatNumber={isRoundTrip ? `${seat.seatNumber} (đi) - ${returnSeats[index]?.seatNumber || ''} (về)` : seat.seatNumber}
                seatId={seat.seatId}
                basePrice={calculateSeatPrice(basePriceOutbound, seat.seatType)}
                insuranceFee={insuranceFee}
                onPassengerUpdate={(p) => handlePassengerUpdate(index, p)}
                onRemoveSeat={() => handleRemoveSeat(seat.seatId, outboundSchedule.id)}
              />
            ))}
          </div>

          <div className="lg:col-span-1">
             <Card className="sticky top-24 shadow-lg border-primary/20">
               <CardHeader className="bg-primary/5 pb-4 flex flex-col gap-3">
                 <CardTitle className="text-lg">Tóm tắt chuyến đi</CardTitle>
               </CardHeader>
               <CardContent className="pt-6 space-y-4 max-h-[60vh] overflow-y-auto">
                 {/* OUTBOUND SUMMARY */}
                 <div className="mb-4">
                   {isRoundTrip && <h4 className="font-bold text-gray-800 border-b pb-2 mb-2">Chiều đi</h4>}
                   <div>
                     <p className="text-sm text-slate-500">Chuyến tàu</p>
                     <p className="font-bold">{outboundSchedule?.train?.train_code} - {outboundSchedule?.train?.train_name}</p>
                   </div>
                   <div>
                     <p className="text-sm text-slate-500">Lộ trình</p>
                     <p className="font-semibold">{outboundSchedule?.origin?.station_name} → {outboundSchedule?.destination?.station_name}</p>
                   </div>
                   <div>
                     <p className="text-sm text-slate-500">Ghế đã chọn</p>
                     <div className="flex gap-2 flex-col mt-2">
                       {outboundSeats.map((s:any) => (
                           <div key={s.seatId} className="flex justify-between items-center bg-blue-50/50 border border-blue-100 rounded-lg p-2">
                             <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-bold rounded text-xs">{s.seatNumber}</span>
                             {s.expiresAt && (
                                 <CountdownDisplay 
                                   expiresAt={s.expiresAt} 
                                   className="text-[10px] px-2 py-1"
                                   onExpire={() => {
                                       toast.error(`Ghế ${s.seatNumber} đã hết thời gian giữ chỗ!`);
                                       handleRemoveSeat(s.seatId, outboundSchedule.id);
                                   }}
                                 />
                             )}
                           </div>
                       ))}
                     </div>
                   </div>
                 </div>

                 {/* RETURN SUMMARY */}
                 {isRoundTrip && (
                  <div className="mb-4 pt-4 border-t border-dashed border-gray-300">
                   <h4 className="font-bold text-gray-800 border-b pb-2 mb-2">Chiều về</h4>
                   <div>
                     <p className="text-sm text-slate-500">Chuyến tàu</p>
                     <p className="font-bold">{returnSchedule?.train?.train_code} - {returnSchedule?.train?.train_name}</p>
                   </div>
                   <div>
                     <p className="text-sm text-slate-500">Lộ trình</p>
                     <p className="font-semibold">{returnSchedule?.origin?.station_name} → {returnSchedule?.destination?.station_name}</p>
                   </div>
                   <div>
                     <p className="text-sm text-slate-500">Ghế đã chọn</p>
                     <div className="flex gap-2 flex-col mt-2">
                       {returnSeats.map((s:any) => (
                           <div key={s.seatId} className="flex justify-between items-center bg-blue-50/50 border border-blue-100 rounded-lg p-2">
                             <span className="px-2 py-0.5 bg-blue-100 text-blue-700 font-bold rounded text-xs">{s.seatNumber}</span>
                             {s.expiresAt && (
                                 <CountdownDisplay 
                                   expiresAt={s.expiresAt} 
                                   className="text-[10px] px-2 py-1"
                                   onExpire={() => {
                                       toast.error(`Ghế ${s.seatNumber} đã hết thời gian giữ chỗ!`);
                                       handleRemoveSeat(s.seatId, returnSchedule.id);
                                   }}
                                 />
                             )}
                           </div>
                       ))}
                     </div>
                   </div>
                  </div>
                 )}

                 <div className="border-t pt-4 mt-4">
                   <div className="flex justify-between font-bold text-lg">
                     <span>Tổng tiền</span>
                     <span className="text-blue-600">{formatPrice(totalPriceOutbound + totalPriceReturn)}</span>
                   </div>
                 </div>
                 {!isFormValid && (
                   <p className="text-xs text-red-500 text-center mt-2">
                     Vui lòng điền đủ thông tin hành khách để tiếp tục
                   </p>
                 )}
               </CardContent>
               <CardFooter>
                 <Button 
                   className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg" 
                   onClick={handleContinue}
                   disabled={!isFormValid || outboundSeats.length === 0 || (isRoundTrip && returnSeats.length === 0)}
                 >  <CreditCard size={20} /> Thanh Toán
                 </Button>
               </CardFooter>
             </Card>

             <div className="mt-4 p-4 bg-green-50 text-green-800 rounded-xl border border-green-200 text-sm flex items-start gap-2">
                <Shield size={16} className="mt-0.5 shrink-0" />
                <p>Thông tin của bạn được bảo mật tuyệt đối và chỉ dùng để xuất vé.</p>
             </div>
          </div>
       </div>
    </div>
  );
}
