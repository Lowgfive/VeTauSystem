import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../hooks/useRedux";
import { updateBalance } from "../store/slices/authSlice";
import { MyBookingsPage } from "../components/MyBookingsPage";
import { getMyBookings, cancelBooking, downloadTicket } from "../services/booking.service";
import { Booking } from "../types";
import { toast } from "sonner";
import { TicketDetailModal } from "../components/TicketDetailModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { AlertCircle, Loader2 } from "lucide-react";
import { Separator } from "../components/ui/separator";

export default function ManageBookingPageWrapper() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [bookingCodeToCancel, setBookingCodeToCancel] = useState<string | null>(null);
  const [isChangeAlertOpen, setIsChangeAlertOpen] = useState(false);
  const [bookingToChange, setBookingToChange] = useState<Booking | null>(null);

  const fetchBookings = async () => {
    // Helper to calculate duration between HH:mm times
    const calculateDuration = (start: string, end: string) => {
      if (!start || !end || start === "N/A" || end === "N/A") return "N/A";
      try {
        const [h1, m1] = start.split(":").map(Number);
        const [h2, m2] = end.split(":").map(Number);
        let totalMinutes = (h2 * 60 + m2) - (h1 * 60 + m1);
        if (totalMinutes < 0) totalMinutes += 24 * 60; // Crosses midnight
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        return `${h}h ${m}m`;
      } catch (e) { return "N/A"; }
    };

    try {
      setLoading(true);
      const res = await getMyBookings();

      // Map backend response to frontend Booking type
      const formattedBookings: Booking[] = res.data.map((b: any) => {
        const schedule = b.schedule_id;
        const train = schedule?.train_id;
        const route = schedule?.route_id;
        const origin = b.departure_station_id || route?.departure_station_id;
        const dest = b.arrival_station_id || route?.arrival_station_id;
        const seat = b.seat_id;

        return {
          id: b._id,
          bookingCode: b.booking_code,
          scheduleId: schedule?._id,
          schedule: null, // full schedule object not strictly needed for this view
          passengers: b.booking_passengers?.map((bp: any) => ({
            id: bp.passenger_id?._id,
            fullName: bp.passenger_id?.full_name,
            idNumber: bp.passenger_id?.id_number,
            passengerType: bp.passenger_id?.passenger_type || "Người lớn",
          })) || [],
          totalAmount: b.total_amount || b.price,
          status: b.status,
          paymentStatus: "paid", // Placeholder, depends on future logic
          paymentMethod: "credit-card",
          createdAt: b.createdAt,
          seats: b.booking_passengers?.map((bp: any) => ({
            _id: bp.seat_id?._id,
            seat_number: bp.seat_id?.seat_number,
          })) || (seat ? [{ _id: seat._id, seat_number: seat.seat_number }] : []),

          // Flattened details for UI
          trainNumber: train?.train_name || "N/A",
          route: {
            origin: origin?.station_name || "N/A",
            destination: dest?.station_name || "N/A",
          },
          departureDateTime: schedule?.date || new Date().toISOString(),
          arrivalDateTime: schedule?.date || new Date().toISOString(),
          departureTime: schedule?.departure_time || "N/A",
          arrivalTime: schedule?.arrival_time || "N/A",
          duration: calculateDuration(schedule?.departure_time, schedule?.arrival_time),
        };
      });

      setBookings(formattedBookings);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lỗi tải danh sách vé");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = (bookingCode: string) => {
    setBookingCodeToCancel(bookingCode);
    setIsAlertOpen(true);
  };

  const handleConfirmedCancel = async () => {
    if (!bookingCodeToCancel) return;
    const code = bookingCodeToCancel;
    setBookingCodeToCancel(null);
    setIsAlertOpen(false);

    try {
      const booking = bookings.find(b => b.bookingCode === code);
      if (!booking) return;


      const res = await cancelBooking(booking.id);
      
      if (res.data?.success && res.data.data?.newBalance !== undefined) {
        dispatch(updateBalance(res.data.data.newBalance));
      }

      toast.success(res.data?.message || "Hủy vé thành công");
      fetchBookings(); // reload
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lỗi khi hủy vé");
    }
  };

  const handleChangeTicket = (booking: Booking) => {
    setBookingToChange(booking);
    setIsChangeAlertOpen(true);
  };

  const handleConfirmedChange = () => {
    if (!bookingToChange) return;
    
    // Save the booking to be changed in localStorage
    localStorage.setItem("change_booking_id", bookingToChange.id);
    localStorage.setItem("change_booking_code", bookingToChange.bookingCode);
    
    setIsChangeAlertOpen(false);
    toast.info(`Vui lòng chọn chuyến tàu và ghế mới cho vé ${bookingToChange.bookingCode}`);
    navigate("/"); // Redirect to home to search for new train
  };

  const handleDownloadTicket = async (bookingCode: string) => {
    try {
      toast.info("Đang chuẩn bị file vé...");
      await downloadTicket(bookingCode);
      toast.success("Tải vé thành công");
    } catch (error: any) {
      toast.error("Lỗi khi tải vé. Vui lòng thử lại sau.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <MyBookingsPage
        bookings={bookings}
        onBack={() => navigate("/")}
        onViewDetails={(booking) => {
          setSelectedBooking(booking);
          setIsModalOpen(true);
        }}
        onCancelBooking={handleCancelBooking}
        onChangeTicket={handleChangeTicket}
        onDownload={handleDownloadTicket}
      />

      <TicketDetailModal
        booking={selectedBooking}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onCancelTicket={handleCancelBooking}
        onChangeTicket={() => selectedBooking && handleChangeTicket(selectedBooking)}
      />

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="max-w-xl rounded-2xl border-0 shadow-2xl p-0 overflow-hidden">
          <div className="bg-red-50 p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <AlertDialogHeader className="space-y-4">
              <AlertDialogTitle className="text-2xl font-bold text-slate-900">Xác nhận thao tác vé?</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-600 text-left">
                Bạn đang yêu cầu xử lý vé <span className="font-mono font-bold text-red-600 underline">{bookingCodeToCancel}</span>. 
                Vui lòng lưu ý các quy định sau:
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <div className="mt-6 w-full text-left bg-white p-5 rounded-xl border border-red-100 shadow-sm space-y-4">
              <div>
                <h5 className="font-bold text-red-700 flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  Chính sách hoàn vé (trả vé)
                </h5>
                <div className="grid grid-cols-2 gap-4 text-[13px]">
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-800 underline">Vé cá nhân:</p>
                    <ul className="list-disc list-inside text-slate-600">
                      <li>≥ 24h: Phí 10%</li>
                      <li>4h - 24h: Phí 20%</li>
                      <li>{"< 4h"}: Không hoàn</li>
                    </ul>
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-800 underline">Vé tập thể:</p>
                    <ul className="list-disc list-inside text-slate-600">
                      <li>≥ 72h: Phí 10%</li>
                      <li>24h - 72h: Phí 20%</li>
                      <li>{"< 24h"}: Không hoàn</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Separator className="bg-slate-100" />

              <div>
                <h5 className="font-bold text-blue-700 flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  Chính sách đổi vé
                </h5>
                <ul className="text-[13px] text-slate-600 space-y-1">
                  <li>• Chỉ đổi vé trước giờ chạy <span className="font-bold text-slate-900">≥ 24 giờ</span></li>
                  <li>• Phí đổi: <span className="font-bold text-slate-900">20.000đ / vé</span></li>
                  <li>• Không áp dụng cho vé tập thể</li>
                </ul>
              </div>
            </div>
            
            <p className="text-[11px] text-slate-400 mt-4 italic">
              * Tiền hoàn (sau khi trừ phí) sẽ được chuyển trực tiếp vào ví của bạn ngay lập tức.
            </p>
          </div>
          <AlertDialogFooter className="p-6 bg-slate-50 flex sm:justify-center gap-3 border-t border-slate-100">
            <AlertDialogCancel className="flex-1 h-12 rounded-xl border-2 hover:bg-white font-bold text-slate-600 transition-all">
              Quay lại
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmedCancel}
              className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 font-bold text-white shadow-lg shadow-red-100 transition-all hover:scale-[1.02]"
            >
              Xác nhận hủy
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Ticket Notification */}
      <AlertDialog open={isChangeAlertOpen} onOpenChange={setIsChangeAlertOpen}>
        <AlertDialogContent className="max-w-xl rounded-2xl border-0 shadow-2xl p-0 overflow-hidden">
          <div className="bg-blue-50 p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-blue-600" />
            </div>
            <AlertDialogHeader className="space-y-4">
              <AlertDialogTitle className="text-2xl font-bold text-slate-900 text-center">Quy định đổi vé tàu?</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-600 text-left">
                Bạn đang yêu cầu đổi lịch cho vé <span className="font-mono font-bold text-blue-600 underline">{bookingToChange?.bookingCode}</span>. 
                Vui lòng xác nhận bạn đã hiểu các quy định sau:
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <div className="mt-6 w-full text-left bg-white p-5 rounded-xl border border-blue-100 shadow-sm space-y-4">
              <div>
                <h5 className="font-bold text-blue-700 flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  Quy trình & Phí đổi vé
                </h5>
                <ul className="text-[13px] text-slate-600 space-y-3">
                  <li className="flex gap-2">
                    <span className="font-bold text-slate-900 whitespace-nowrap">Thời gian:</span>
                    <span>Chỉ áp dụng đổi vé trước giờ tàu chạy <span className="font-bold text-red-600">≥ 24 giờ</span>.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-slate-900 whitespace-nowrap">Phí đổi:</span>
                    <span>Phí cố định <span className="font-bold text-primary">20.000đ / vé</span>.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-slate-900 whitespace-nowrap">Hạng vé:</span>
                    <span>Không áp dụng đổi vé cho các loại vé tập thể.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-slate-900 whitespace-nowrap">Chênh lệch:</span>
                    <span>Vé mới đắt hơn sẽ trừ thêm tiền từ ví. Vé mới rẻ hơn sẽ được hoàn lại phần thừa vào ví (sau khi trừ phí).</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <AlertDialogFooter className="p-6 bg-slate-50 flex sm:justify-center gap-3 border-t border-slate-100">
            <AlertDialogCancel className="flex-1 h-12 rounded-xl border-2 hover:bg-white font-bold text-slate-600 transition-all">
              Bỏ qua
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmedChange}
              className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-white shadow-lg shadow-blue-100 transition-all hover:scale-[1.02]"
            >
              Tiếp tục đổi vé
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
