import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { TrainSearchResults } from "../components/TrainSearchResults";
import { searchSchedules } from "../services/schedule.service";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function SearchResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<any[]>([]);
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
        const response = await searchSchedules(
          searchParams.originName,
          searchParams.destinationName,
          searchParams.date,
          searchParams.returnDate,
          searchParams.originCode,
          searchParams.destinationCode
        );

        if (response.success) {

          const departureTrips = (response.data.departureTrips || []).map((trip: any) => ({
            id: trip._id,
            trainId: trip.train_id,
            type: "departure",
            train: {
              _id: trip.train?._id,
              train_code: trip.train?.train_code,
              train_name: trip.train?.train_name,
              train_type: trip.train?.train_type,
              total_carriages: trip.train?.total_carriages ?? 0,
              capacity: trip.train?.capacity ?? trip.availableSeats ?? 0,
              max_speed: trip.train?.max_speed ?? 0,
              amenities: trip.train?.amenities || ["wifi", "air-conditioning"],
              is_active: trip.train?.is_active ?? true,
              status: trip.train?.status,
              template_id: trip.train?.template_id,
            },
            origin: { station_name: trip.departure_station, id: trip.departure_station_id },
            destination: { station_name: trip.arrival_station, id: trip.arrival_station_id },
            departureTime: trip.departure_time,
            arrivalTime: trip.arrival_time,
            date: response.data?.departureDate || searchParams.date,
            basePrice: trip.price,
            availableSeats: trip.availableSeats,
            duration: trip.duration,
            status: "on-time"
          }));
        
        
          const returnTrips = (response.data.returnTrips || []).map((trip: any) => ({
            id: trip._id,
            trainId: trip.train_id,
            type: "return",
            train: {
              _id: trip.train?._id,
              train_code: trip.train?.train_code,
              train_name: trip.train?.train_name,
              train_type: trip.train?.train_type,
              total_carriages: trip.train?.total_carriages ?? 0,
              capacity: trip.train?.capacity ?? trip.availableSeats ?? 0,
              max_speed: trip.train?.max_speed ?? 0,
              amenities: trip.train?.amenities || ["wifi", "air-conditioning"],
              is_active: trip.train?.is_active ?? true,
              status: trip.train?.status,
              template_id: trip.train?.template_id,
            },
            origin: { station_name: trip.departure_station, id: trip.departure_station_id },
            destination: { station_name: trip.arrival_station, id: trip.arrival_station_id },
            departureTime: trip.departure_time,
            arrivalTime: trip.arrival_time,
            date: response.data?.returnDate || searchParams.returnDate,
            basePrice: trip.price,
            availableSeats: trip.availableSeats,
            duration: trip.duration,
            status: "on-time"
          }));
        
        
          setSchedules([...departureTrips, ...returnTrips]);
        }
        else {
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
        date: searchParams?.date || "",
        returnDate: searchParams?.returnDate || ""
      }}
      onSelectTrain={(schedule, returnSchedule) => {
        console.log("Navigating to booking with Schedule ID:", schedule.id);
        navigate(`/booking/${schedule.id}`, { state: { schedule, returnSchedule } });
      }}
      onBack={() => navigate("/")}
    />
  );
}
