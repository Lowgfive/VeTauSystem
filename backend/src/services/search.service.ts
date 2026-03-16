import { Station } from "../models/station.model";
import { Route } from "../models/route.model";
import { Schedule } from "../models/schedule.model";

interface TrainResult {
  train_id: string;
  departure_station: string;
  arrival_station: string;
  departure_time: string;
  arrival_time: string;
  distance: number;
  duration: number;
  price: number;
}

export class SearchService {

  // ─────────────────────────────
  // SEARCH 1 CHIỀU
  // ─────────────────────────────
  private static async searchOneWay(
    departureStation: string,
    arrivalStation: string,
    date: string
  ): Promise<{ trips: TrainResult[]; message?: string }> {

    // 1. tìm ga
    const depStation = await Station.findOne({
      station_name: new RegExp(`^(Ga\\s+)?${departureStation}$`, "i")
    }).lean();

    const arrStation = await Station.findOne({
      station_name: new RegExp(`^(Ga\\s+)?${arrivalStation}$`, "i")
    }).lean();

    if (!depStation || !arrStation) {
      return { trips: [], message: "Không tìm thấy ga" };
    }

    if (depStation.station_order === arrStation.station_order) {
      return { trips: [], message: "Ga đi và ga đến trùng nhau" };
    }

    // 2. xác định hướng
    const direction =
      depStation.station_order < arrStation.station_order ? 1 : -1;

    const minOrder = Math.min(
      depStation.station_order,
      arrStation.station_order
    );

    const maxOrder = Math.max(
      depStation.station_order,
      arrStation.station_order
    );

    // 3. lấy các ga nằm giữa
    const stations = await Station.find({
      station_order: { $gte: minOrder, $lte: maxOrder }
    })
      .sort({ station_order: direction })
      .lean();

    if (stations.length < 2) {
      return { trips: [], message: "Không tìm thấy tuyến" };
    }

    // 4. build segments
    const segments: any[] = [];

    for (let i = 0; i < stations.length - 1; i++) {
      segments.push({
        departure_station_id: stations[i]._id,
        arrival_station_id: stations[i + 1]._id
      });
    }

    // 5. tìm routes
    const routes = await Route.find({
      $or: segments
    }).lean();

    if (routes.length === 0) {
      return { trips: [], message: "Không có tuyến tàu" };
    }

    const routeIds = routes.map(r => r._id);

    // 6. filter date
    const dayStart = new Date(date + "T00:00:00.000Z");
    const dayEnd = new Date(date + "T23:59:59.999Z");

    const schedules = await Schedule.find({
      route_id: { $in: routeIds },
      date: { $gte: dayStart, $lte: dayEnd }
    })
    .populate({
      path: 'train_id',
      populate: { path: 'line_id' }
    })
    .populate('route_id')
    .lean();

    if (schedules.length === 0) {
      return { trips: [], message: "Không có chuyến tàu trong ngày này" };
    }

    // 7. group theo train
    const trainMap = new Map<string, any[]>();

    for (const s of (schedules as any[])) {
      const trainId = s.train_id?._id?.toString() || s.train_id?.toString();
      if (!trainId) continue;

      if (!trainMap.has(trainId)) {
        trainMap.set(trainId, []);
      }

      trainMap.get(trainId)!.push(s);
    }

    const results: any[] = [];

    // 8. build kết quả
    for (const [trainId, trainSchedules] of trainMap.entries()) {
      trainSchedules.sort((a, b) =>
        a.departure_time.localeCompare(b.departure_time)
      );

      const first = trainSchedules[0];
      const last = trainSchedules[trainSchedules.length - 1];

      let totalDistance = 0;
      let totalDuration = 0;

      for (const s of trainSchedules) {
        if (s.route_id) {
          totalDistance += s.route_id.distance || 0;
          totalDuration += s.route_id.hour || 0;
        }
      }

      const price = totalDistance * 1000;

      results.push({
        _id: first._id,
        train_id: trainId,
        train: first.train_id, // Full train object
        departure_station: depStation.station_name,
        arrival_station: arrStation.station_name,
        departure_time: first.departure_time,
        arrival_time: last.arrival_time,
        distance: totalDistance,
        duration: `${totalDuration}h 00m`,
        price,
        availableSeats: first.train_id?.capacity || 100 // Fallback
      });
    }

    if (results.length === 0) {
      return { trips: [], message: "Không có chuyến tàu phù hợp" };
    }

    return { trips: results };
  }


  // ─────────────────────────────
  // SEARCH CHÍNH (2 CHIỀU)
  // ─────────────────────────────
  static async searchTrain(
    departureStation: string,
    arrivalStation: string,
    departureDate: string,
    returnDate?: string
  ) {

    try {

      // search chiều đi
      const departure = await this.searchOneWay(
        departureStation,
        arrivalStation,
        departureDate
      );

      if (departure.trips.length === 0) {
        return {
          success: false,
          message: departure.message
        };
      }

      // search chiều về
      let returnTrips: TrainResult[] = [];

      if (returnDate) {

        const returnResult = await this.searchOneWay(
          arrivalStation,
          departureStation,
          returnDate
        );

        returnTrips = returnResult.trips;
      }

      return {
        success: true,
        message: "Tìm chuyến tàu thành công",
        data: {
          departureTrips: departure.trips,
          returnTrips
        }
      };

    } catch (error) {

      console.error("Search error:", error);

      return {
        success: false,
        message: "Lỗi hệ thống"
      };
    }
  }
}