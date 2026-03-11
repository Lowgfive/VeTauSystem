import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MyBookingsPage } from "../components/MyBookingsPage";
import { getMyBookings, cancelBooking } from "../services/booking.service";
import { Booking } from "../types";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function ManageBookingPageWrapper() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await getMyBookings();
      
      // Map backend response to frontend Booking type
      const formattedBookings: Booking[] = res.data.map((b: any) => {
        const schedule = b.schedule_id;
        const train = schedule?.train_id;
        const route = schedule?.route_id;
        const origin = route?.departure_station_id;
        const dest = route?.arrival_station_id;
        const seat = b.seat_id;

        return {
          id: b._id,
          bookingCode: b.booking_code,
          scheduleId: schedule?._id,
          schedule: null, // full schedule object not strictly needed for this view
          passengers: [], // passengers feature not fully implemented yet
          totalAmount: b.price,
          status: b.status,
          paymentStatus: "paid", // Placeholder, depends on future logic
          paymentMethod: "credit-card",
          createdAt: b.createdAt,
          seats: seat ? [{
            id: seat._id,
            number: seat.seat_number,
          }] : [],
          
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
          duration: "N/A", // Can be calculated if needed
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

  const handleCancelBooking = async (bookingCode: string) => {
    try {
      // We need to find the booking _id since the API expects bookingId
      const booking = bookings.find(b => b.bookingCode === bookingCode);
      if (!booking) return;

      await cancelBooking(booking.id);
      toast.success("Hủy vé thành công");
      fetchBookings(); // reload
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lỗi khi hủy vé");
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
    <MyBookingsPage
      bookings={bookings}
      onBack={() => navigate("/")}
      onViewDetails={(booking) => {
        // Option to navigate to a ticket detail page or show modal
        toast.info(`Chi tiết vé: ${booking.bookingCode}`);
      }}
      onCancelBooking={handleCancelBooking}
    />
  );
}
