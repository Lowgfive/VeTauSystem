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

    const [depStation, arrStation] = await Promise.all([
      Station.findOne({ station_name: departureStation }).lean(),
      Station.findOne({ station_name: arrivalStation }).lean(),
    ]);

    if (!depStation) {
      return { trips: [], message: "Không tìm thấy ga đi" };
    }

    if (!arrStation) {
      return { trips: [], message: "Không tìm thấy ga đến" };
    }

    if (depStation.station_order === arrStation.station_order) {
      return {
        trips: [],
        message: "Ga đi và ga đến không được trùng nhau",
      };
    }

    const depOrder = depStation.station_order;
    const arrOrder = arrStation.station_order;

    const direction = depOrder < arrOrder ? 1 : -1;

    const minOrder = Math.min(depOrder, arrOrder);
    const maxOrder = Math.max(depOrder, arrOrder);

    // tìm các ga nằm giữa
    const stations = await Station.find({
      station_order: { $gte: minOrder, $lte: maxOrder },
    })
      .sort({ station_order: direction })
      .lean();

    if (stations.length < 2) {
      return {
        trips: [],
        message: "Không tìm thấy tuyến đường giữa hai ga",
      };
    }

    // build segments
    const segments = [];

    for (let i = 0; i < stations.length - 1; i++) {
      segments.push({
        departure_station_id: stations[i]._id,
        arrival_station_id: stations[i + 1]._id,
      });
    }


    const routes = await Route.find({ $or: segments }).lean();
    console.log("route", routes)
    if (routes.length === 0) {
      return {
        trips: [],
        message: "Không có tuyến tàu giữa hai ga",
      };
    }

    const routeIds = routes.map((r) => r._id);


    const dateString = date; // "2026-03-09"

    const dayStart = new Date(dateString + "T00:00:00.000Z");
    const dayEnd = new Date(dateString + "T23:59:59.999Z");

    const schedules = await Schedule.find({
      route_id: { $in: routeIds },
      date: { $gte: dayStart, $lte: dayEnd },
    })
    console.log("dayStart:", dayStart);
    console.log("dayEnd:", dayEnd);
    console.log(schedules)
    if (schedules.length === 0) {
      return {
        trips: [],
        message: "Không có chuyến tàu trong ngày này",
      };
    }

    // group theo train
    const trainMap = new Map<string, any[]>();

    for (const s of schedules) {
      const trainId = (s.train_id as any)._id.toString();

      if (!trainMap.has(trainId)) {
        trainMap.set(trainId, []);
      }

      trainMap.get(trainId)!.push(s);
    }

    const results: TrainResult[] = [];

    for (const [trainId, trainSchedules] of trainMap.entries()) {

      if (trainSchedules.length < segments.length) continue;

      trainSchedules.sort((a, b) =>
        a.departure_time.localeCompare(b.departure_time)
      );

      const first = trainSchedules[0];
      const last = trainSchedules[trainSchedules.length - 1];

      let totalDistance = 0;
      let totalDuration = 0;

      for (const r of routes) {
        totalDistance += r.distance;
        totalDuration += r.hour;
      }

      const basePricePerKm = 1000;
      const price = totalDistance * basePricePerKm;

      results.push({
        train_id: trainId,
        departure_station: depStation.station_name,
        arrival_station: arrStation.station_name,
        departure_time: first.departure_time,
        arrival_time: last.arrival_time,
        distance: totalDistance,
        duration: totalDuration,
        price,
      });
    }

    if (results.length === 0) {
      return {
        trips: [],
        message: "Không có chuyến tàu phù hợp",
      };
    }

    return { trips: results };
  }

  // ─────────────────────────────
  // SEARCH CHÍNH
  // ─────────────────────────────
  static async searchTrain(
    departureStation: string,
    arrivalStation: string,
    departureDate: string,
    returnDate?: string
  ) {
    try {

      const departure = await this.searchOneWay(
        departureStation,
        arrivalStation,
        departureDate
      );

      if (departure.trips.length === 0) {
        return {
          success: false,
          message: departure.message,
        };
      }

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
          returnTrips,
        },
      };

    } catch (error) {
      console.error("[SearchService]", error);

      return {
        success: false,
        message: "Lỗi hệ thống",
      };
    }
  }
}