import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { TrainSearchResults } from "../components/TrainSearchResults";
import { searchSchedules } from "../services/schedule.service";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function SearchResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const searchParams = location.state?.searchParams;

  useEffect(() => {
    if (!searchParams) {
      navigate("/");
      return;
    }

    const performSearch = async () => {
      try {
        setLoading(true);
        const response = await searchSchedules({
          departureCode: searchParams.originName,
          arrivalCode: searchParams.destinationName,
          date: searchParams.date,
          returndate: searchParams.returnDate
        });

        if (response.success) {
          // Transform backend data to frontend Schedule format
          const mapped = (response.data.departureTrips || []).map((trip: any) => ({
            id: trip._id,
            trainId: trip.train_id,
            train: {
              id: trip.train?._id,
              code: trip.train?.train_code,
              name: trip.train?.train_name,
              type: trip.train?.train_type,
              carriages: [], // We'll fetch this in seat selection
              amenities: trip.train?.amenities || ["Điều hòa", "Wifi"]
            },
            originId: trip.departure_station,
            origin: { name: trip.departure_station },
            destinationId: trip.arrival_station,
            destination: { name: trip.arrival_station },
            departureTime: trip.departure_time,
            arrivalTime: trip.arrival_time,
            date: searchParams.date,
            basePrice: trip.price,
            availableSeats: trip.availableSeats,
            duration: trip.duration,
            status: "on-time"
          }));
          setSchedules(mapped);
        } else {
          toast.error(response.message || "Không tìm thấy chuyến tàu");
          setSchedules([]);
        }
      } catch (error) {
        console.error("Search error:", error);
        toast.error("Đã xảy ra lỗi khi tìm kiếm");
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-gray-600 font-medium">Đang tìm kiếm chuyến tàu tốt nhất...</p>
      </div>
    );
  }

  return (
    <TrainSearchResults
      schedules={schedules}
      searchParams={{
        originName: searchParams?.originName || "",
        destinationName: searchParams?.destinationName || "",
        date: searchParams?.date || ""
      }}
      onSelectTrain={(schedule) => {
        navigate(`/booking/${schedule.train_id}`, { state: { schedule } });
      }}
      onBack={() => navigate("/")}
    />
  );
}
