import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

export default function ManageBookingPageWrapper() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [bookingCodeToCancel, setBookingCodeToCancel] = useState<string | null>(null);

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

      await cancelBooking(booking.id);
      toast.success("Hủy vé thành công");
      fetchBookings(); // reload
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lỗi khi hủy vé");
    }
  };

  const handleChangeTicket = (booking: Booking) => {
    // Save the booking to be changed in localStorage
    localStorage.setItem("change_booking_id", booking.id);
    localStorage.setItem("change_booking_code", booking.bookingCode);
    
    toast.info(`Vui lòng chọn chuyến tàu và ghế mới cho vé ${booking.bookingCode}`);
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
        <AlertDialogContent className="max-w-md rounded-2xl border-0 shadow-2xl p-0 overflow-hidden">
          <div className="bg-red-50 p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <AlertDialogHeader className="space-y-2">
              <AlertDialogTitle className="text-2xl font-bold text-slate-900">Xác nhận hủy vé?</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-600">
                Bạn có chắc chắn muốn hủy vé <span className="font-mono font-bold text-red-600 underline">{bookingCodeToCancel}</span>? 
                Hành động này <span className="font-semibold text-slate-900">không thể hoàn tác</span> và chỗ ngồi sẽ được giải phóng ngay lập tức.
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>
          <AlertDialogFooter className="p-6 bg-white flex sm:justify-center gap-3">
            <AlertDialogCancel className="flex-1 h-12 rounded-xl border-2 hover:bg-slate-50 font-bold text-slate-700">
              Quay lại
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmedCancel}
              className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 font-bold text-white shadow-lg shadow-red-200"
            >
              Xác nhận hủy
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
