import { Station } from "../models/station.model";
import { Route } from "../models/route.model";
import { Schedule } from "../models/schedule.model";
import { redisClient } from "../config/redis";
import { Carriage } from "../models/carriage.model";
import Booking from "../models/booking.model";
import { BookingPassenger } from "../models/bookingpassenger.model";
import { Seat } from "../models/seat.model";

const escapeRegex = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/** Chuẩn hóa chuỗi tìm ga (Unicode NFC, trim, gom khoảng trắng). */
function normalizeStationSearchInput(raw: string): string {
  return raw.normalize("NFC").trim().replace(/\s+/g, " ");
}

/** Chuyến dài có thể sang ngày hôm sau — số ngày tối đa để gom đủ các chặng của cùng một tàu. */
const SEARCH_SCHEDULE_DATE_WINDOW_DAYS = 7;

interface TrainResult {
  train_id: string;
  departure_station: string;
  arrival_station: string;
  departure_time: string;
  arrival_time: string;
  distance: number;
  duration: string;
  price: number;
  date?: Date | string;
  availableSeats?: number;
  train?: any;
  departure_station_id?: string;
  arrival_station_id?: string;
  _id?: any;
}

export class SearchService {
  /**
   * Tìm ga theo tên hiển thị (có/không tiền tố "Ga "), hoặc theo mã ga (HN, NB…).
   */
  private static async findStationBySearchInput(raw: string) {
    const input = normalizeStationSearchInput(raw);
    if (!input) return null;

    const escaped = escapeRegex(input);
    const strictName = new RegExp(`^(Ga\\s+)?${escaped}$`, "i");

    let station = await Station.findOne({ station_name: strictName }).lean();
    if (station) return station;

    if (/^[a-z0-9]{2,10}$/i.test(input)) {
      const codeRx = new RegExp(`^${escapeRegex(input)}$`, "i");
      station = await Station.findOne({ station_code: codeRx }).lean();
      if (station) return station;
    }

    // Khớp lỏng: tên DB chứa chuỗi người dùng (ví dụ "Ga Ninh Bình" ↔ "Ninh Bình")
    station = await Station.findOne({
      station_name: new RegExp(escaped, "i"),
    }).lean();
    return station;
  }

  /** Ưu tiên tên; nếu không có trong DB thì thử `station_code` (HN, NB, …). */
  private static async resolveStation(
    displayName: string,
    fallbackCode?: string
  ) {
    const byName = await this.findStationBySearchInput(displayName);
    if (byName) return byName;

    const code = fallbackCode?.trim();
    if (!code) return null;

    return await Station.findOne({
      station_code: new RegExp(`^${escapeRegex(code)}$`, "i"),
    }).lean();
  }

  private static formatDurationFromHours(hours: number) {
    const durationMinutes = Math.round(hours * 60);
    const h = Math.floor(durationMinutes / 60);
    const m = durationMinutes % 60;
    return `${h}h ${m}m`;
  }

  private static calculateArrivalTime(departureTime: string, durationHours: number): string {
    const [hours, minutes] = departureTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + Math.round(durationHours * 60);
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = totalMinutes % 60;
    return `${newHours.toString().padStart(2, "0")}:${newMinutes.toString().padStart(2, "0")}`;
  }

  // ─────────────────────────────
  // SEARCH 1 CHIỀU
  // ─────────────────────────────
private static async searchOneWay(
  departureStation: string,
  arrivalStation: string,
  date: string,
  limit: number,
  skip: number,
  departureStationCode?: string,
  arrivalStationCode?: string
): Promise<{ trips: TrainResult[]; message?: string }> {

  // 1. resolve station
  const depStation = await this.resolveStation(departureStation, departureStationCode);
  const arrStation = await this.resolveStation(arrivalStation, arrivalStationCode);

  if (!depStation || !arrStation) {
    return { trips: [], message: "Không tìm thấy ga" };
  }

  if (depStation.station_order === arrStation.station_order) {
    return { trips: [], message: "Ga đi và ga đến trùng nhau" };
  }

  // 2. direction + stations
  const direction = depStation.station_order < arrStation.station_order ? 1 : -1;

  const stations = await Station.find({
    station_order: {
      $gte: Math.min(depStation.station_order, arrStation.station_order),
      $lte: Math.max(depStation.station_order, arrStation.station_order)
    }
  })
    .sort({ station_order: direction })
    .lean();

  if (stations.length < 2) {
    return { trips: [], message: "Không tìm thấy tuyến" };
  }

  // 3. segments
  const segments = [];
  for (let i = 0; i < stations.length - 1; i++) {
    segments.push({
      departure_station_id: stations[i]._id,
      arrival_station_id: stations[i + 1]._id
    });
  }

  const routes = await Route.find({ $or: segments }).lean();

  const orderedRoutes = segments.map(seg =>
    routes.find(r =>
      r.departure_station_id.toString() === seg.departure_station_id.toString() &&
      r.arrival_station_id.toString() === seg.arrival_station_id.toString()
    )
  );

  if (orderedRoutes.some(r => !r)) {
    return { trips: [], message: "Không có tuyến tàu đầy đủ" };
  }

  const routeIds = orderedRoutes.map(r => r!._id.toString());
  const firstRouteId = routeIds[0];

  // 4. date window
  const [y, m, d] = date.split("-").map(Number);
  const dayStart = new Date(y, m - 1, d);
  const windowEnd = new Date(y, m - 1, d + SEARCH_SCHEDULE_DATE_WINDOW_DAYS);

  // 5. get schedules (1 query)
  const schedules = await Schedule.find({
    route_id: { $in: routeIds },
    date: { $gte: dayStart, $lte: windowEnd }
  })
    .populate("train_id")
    .populate("route_id")
    .lean();

  if (!schedules.length) {
    return { trips: [], message: "Không có chuyến tàu" };
  }

  // 6. group by train
  const trainMap = new Map<string, any[]>();

  for (const s of schedules) {
    const trainId = s.train_id?._id?.toString();
    if (!trainId) continue;

    if (!trainMap.has(trainId)) trainMap.set(trainId, []);
    trainMap.get(trainId)!.push(s);
  }

  // 🔥 7. preload ALL data (no N+1)
  const allScheduleIds = schedules.map(s => s._id);

  const bookings = await Booking.find({
    schedule_id: { $in: allScheduleIds },
    status: { $in: ["pending", "confirmed", "paid"] }
  }).select("_id schedule_id");

  const bookingMap = new Map<string, string[]>();
  bookings.forEach(b => {
    const sid = b.schedule_id.toString();
    if (!bookingMap.has(sid)) bookingMap.set(sid, []);
    bookingMap.get(sid)!.push(b._id.toString());
  });

  const passengers = await BookingPassenger.find({
    booking_id: { $in: bookings.map(b => b._id) }
  }).select("booking_id");

  const passengerCount = new Map<string, number>();
  passengers.forEach(p => {
    const bid = p.booking_id.toString();
    passengerCount.set(bid, (passengerCount.get(bid) || 0) + 1);
  });

  // 8. build result
  const results: TrainResult[] = [];

  for (const [trainId, trainSchedules] of trainMap.entries()) {

    // đủ route chưa
    const covered = new Set(
      trainSchedules.map(s => s.route_id?._id?.toString())
    );
    if (covered.size !== routeIds.length) continue;

    // tìm chặng đầu đúng ngày
    const firstLeg = trainSchedules.find(s =>
      s.route_id?._id?.toString() === firstRouteId &&
      new Date(s.date).toDateString() === dayStart.toDateString()
    );

    if (!firstLeg) continue;

    const train = firstLeg.train_id;
    const capacity = train.capacity || 100;

    // 🔥 tính booked nhanh
    let totalBooked = 0;

    for (const s of trainSchedules) {
      const bIds = bookingMap.get(s._id.toString()) || [];
      for (const bid of bIds) {
        totalBooked += passengerCount.get(bid) || 0;
      }
    }

    const availableSeats = capacity - totalBooked;
    if (availableSeats <= 0) continue;

    // calc distance
    let distance = 0;
    let duration = 0;

    for (const r of orderedRoutes) {
      distance += r!.distance || 0;
      duration += r!.hour || 0;
    }

    const arrivalTime = this.calculateArrivalTime(
      firstLeg.departure_time,
      duration
    );

    results.push({
      _id: firstLeg._id,
      train_id: trainId,
      train,
      departure_station: depStation.station_name,
      arrival_station: arrStation.station_name,
      departure_station_id: String(depStation._id),
      arrival_station_id: String(arrStation._id),
      date: firstLeg.date,
      departure_time: firstLeg.departure_time,
      arrival_time: arrivalTime,
      distance,
      duration: this.formatDurationFromHours(duration),
      price: distance * 1000,
      availableSeats
    });
  }

  if (!results.length) {
    return { trips: [], message: "Không có chuyến phù hợp" };
  }

  return {
    trips: results.slice(skip, skip + limit)
  };
}


  // ─────────────────────────────
  // SEARCH CHÍNH (2 CHIỀU)
  // ─────────────────────────────
  static async searchTrain(
    departureStation: string,
    arrivalStation: string,
    departureDate: string,
    returnDate: string | undefined = undefined,
    page: number = 1,
    limit: number = 10,
    departureStationCode?: string,
    arrivalStationCode?: string
  ) {

    try {
      const cacheKey = `search:${departureStation}:${arrivalStation}:${departureDate}:${returnDate || "oneway"}:${page}:${limit}:${departureStationCode || ""}:${arrivalStationCode || ""}`;
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const skip = (page - 1) * limit;

      const departure = await this.searchOneWay(
        departureStation,
        arrivalStation,
        departureDate,
        limit,
        skip,
        departureStationCode,
        arrivalStationCode
      );

      if (departure.trips.length === 0) {
        return {
          success: false,
          message: departure.message
        };
      }

      let returnTrips: TrainResult[] = [];

      if (returnDate) {
        const returnResult = await this.searchOneWay(
          arrivalStation,
          departureStation,
          returnDate,
          limit,
          skip,
          arrivalStationCode,
          departureStationCode
        );
        returnTrips = returnResult.trips;
      }

      const resultData = {
        success: true,
        message: "Tìm chuyến tàu thành công",
        data: {
          departureDate,
          returnDate: returnDate || null,
          departureTrips: departure.trips,
          returnTrips,
          page,
          limit
        }
      };

      await redisClient.set(cacheKey, JSON.stringify(resultData), { EX: 30 });

      return resultData;

    } catch (error) {
      console.error("Search error:", error);
      return {
        success: false,
        message: "Lỗi hệ thống"
      };
    }
  }
}
