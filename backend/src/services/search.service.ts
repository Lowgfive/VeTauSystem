import { redisClient } from "../config/redis";
import Booking from "../models/booking.model";
import { BookingPassenger } from "../models/bookingpassenger.model";
import { Route } from "../models/route.model";
import { Schedule } from "../models/schedule.model";
import { Station } from "../models/station.model";
import {
  calculateBaseRoutePrice,
  calculateTotalRouteDistance,
} from "../utils/pricing";

const escapeRegex = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

function normalizeStationSearchInput(raw: string): string {
  return raw.normalize("NFC").trim().replace(/\s+/g, " ");
}

/**
 * Search cần query rộng hơn ngày người dùng chọn vì một train có thể được biểu diễn
 * bằng nhiều schedule segment và các segment sau có thể rơi sang ngày kế tiếp.
 * Kết quả cuối vẫn chỉ hiển thị các train có first leg đúng ngày user tìm.
 */
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

type RouteSegment = {
  departure_station_id: any;
  arrival_station_id: any;
};

export class SearchService {
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

    station = await Station.findOne({
      station_name: new RegExp(escaped, "i"),
    }).lean();

    return station;
  }

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

  private static calculateArrivalTime(
    departureTime: string,
    durationHours: number
  ): string {
    const [hours, minutes] = departureTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + Math.round(durationHours * 60);
    const h = Math.floor(totalMinutes / 60) % 24;
    const m = totalMinutes % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  }

  private static getDateTime(date: Date | string, timeStr: string): Date {
    const d = new Date(date);
    const [h, m] = timeStr.split(":").map(Number);
    d.setHours(h, m, 0, 0);
    return d;
  }

  private static isJourneyOverlapping(
    searchStart: number,
    searchEnd: number,
    bookingStart: number,
    bookingEnd: number
  ) {
    const normalizedSearchStart = Math.min(searchStart, searchEnd);
    const normalizedSearchEnd = Math.max(searchStart, searchEnd);
    const normalizedBookingStart = Math.min(bookingStart, bookingEnd);
    const normalizedBookingEnd = Math.max(bookingStart, bookingEnd);

    return (
      Math.max(normalizedSearchStart, normalizedBookingStart) <
      Math.min(normalizedSearchEnd, normalizedBookingEnd)
    );
  }

  private static buildRouteSegments(stations: any[]): RouteSegment[] {
    const segments: RouteSegment[] = [];

    for (let i = 0; i < stations.length - 1; i++) {
      segments.push({
        departure_station_id: stations[i]._id,
        arrival_station_id: stations[i + 1]._id,
      });
    }

    return segments;
  }

  private static async searchOneWay(
    departureStation: string,
    arrivalStation: string,
    date: string,
    limit: number,
    skip: number,
    departureStationCode?: string,
    arrivalStationCode?: string
  ): Promise<{ trips: TrainResult[]; message?: string }> {
    const depStation = await this.resolveStation(
      departureStation,
      departureStationCode
    );
    const arrStation = await this.resolveStation(
      arrivalStation,
      arrivalStationCode
    );

    if (!depStation || !arrStation) {
      return { trips: [], message: "Khong tim thay ga" };
    }

    if (depStation.station_order === arrStation.station_order) {
      return { trips: [], message: "Ga di va ga den trung nhau" };
    }

    const direction = depStation.station_order < arrStation.station_order ? 1 : -1;

    const stations = await Station.find({
      station_order: {
        $gte: Math.min(depStation.station_order, arrStation.station_order),
        $lte: Math.max(depStation.station_order, arrStation.station_order),
      },
    })
      .sort({ station_order: direction })
      .lean();

    if (stations.length < 2) {
      return { trips: [], message: "Khong tim thay tuyen" };
    }

    const stationOrderMap = new Map(
      stations.map((station) => [station._id.toString(), station.station_order])
    );

    const segments = this.buildRouteSegments(stations);
    const routes = await Route.find({ $or: segments }).lean();

    const orderedRoutes = segments.map((segment) =>
      routes.find(
        (route) =>
          route.departure_station_id.toString() ===
            segment.departure_station_id.toString() &&
          route.arrival_station_id.toString() ===
            segment.arrival_station_id.toString()
      )
    );

    if (orderedRoutes.some((route) => !route)) {
      return { trips: [], message: "Khong co tuyen tau day du" };
    }

    const routeDocs = orderedRoutes.filter(Boolean);
    const routeIds = routeDocs.map((route) => route!._id.toString());
    const firstRouteId = routeIds[0];

    const [y, m, d] = date.split("-").map(Number);
    const dayStart = new Date(y, m - 1, d);
    // Query rộng hơn ngày search để gom đủ các segment cùng chuyến chạy qua đêm.
    const windowEnd = new Date(y, m - 1, d + SEARCH_SCHEDULE_DATE_WINDOW_DAYS);

    const schedules = await Schedule.find({
      route_id: { $in: routeIds },
      date: { $gte: dayStart, $lte: windowEnd },
    })
      .populate("train_id")
      .populate("route_id")
      .lean();

    if (!schedules.length) {
      return { trips: [], message: "Khong co chuyen tau" };
    }

    const trainMap = new Map<string, any[]>();

    for (const schedule of schedules) {
      const trainId = schedule.train_id?._id?.toString();
      if (!trainId) continue;

      if (!trainMap.has(trainId)) {
        trainMap.set(trainId, []);
      }

      trainMap.get(trainId)!.push(schedule);
    }

    const allScheduleIds = schedules.map((schedule) => schedule._id);
    const bookings = await Booking.find({
      schedule_id: { $in: allScheduleIds },
      status: { $in: ["pending", "confirmed", "paid"] },
    }).select("_id schedule_id departure_station_id arrival_station_id");

    const extraStationIds = Array.from(
      new Set(
        bookings.flatMap((booking) => [
          booking.departure_station_id?.toString(),
          booking.arrival_station_id?.toString(),
        ]).filter(Boolean) as string[]
      )
    ).filter((stationId) => !stationOrderMap.has(stationId));

    if (extraStationIds.length > 0) {
      const extraStations = await Station.find({
        _id: { $in: extraStationIds },
      })
        .select("_id station_order")
        .lean();

      for (const station of extraStations) {
        stationOrderMap.set(station._id.toString(), station.station_order);
      }
    }

    const bookingMap = new Map<
      string,
      Array<{ bookingId: string; depOrder?: number; arrOrder?: number }>
    >();

    for (const booking of bookings) {
      const scheduleId = booking.schedule_id.toString();
      if (!bookingMap.has(scheduleId)) {
        bookingMap.set(scheduleId, []);
      }

      bookingMap.get(scheduleId)!.push({
        bookingId: booking._id.toString(),
        depOrder: booking.departure_station_id
          ? stationOrderMap.get(booking.departure_station_id.toString())
          : undefined,
        arrOrder: booking.arrival_station_id
          ? stationOrderMap.get(booking.arrival_station_id.toString())
          : undefined,
      });
    }

    const bookingPassengers = await BookingPassenger.find({
      booking_id: { $in: bookings.map((booking) => booking._id) },
      status: { $in: ["reserved", "confirmed", "paid"] },
    }).select("booking_id seat_id");

    const bookingSeatMap = new Map<string, Set<string>>();

    for (const passenger of bookingPassengers) {
      const bookingId = passenger.booking_id.toString();

      if (!bookingSeatMap.has(bookingId)) {
        bookingSeatMap.set(bookingId, new Set());
      }

      bookingSeatMap.get(bookingId)!.add(passenger.seat_id.toString());
    }

    const results: TrainResult[] = [];

    for (const [trainId, trainSchedules] of trainMap.entries()) {
      // 1. Kiểm tra hướng tàu (forward=1, backward=-1)
      const sample = trainSchedules[0];
      const trainObj = sample.train_id as any;
      if (trainObj?.direction) {
        const trainDir = trainObj.direction === "forward" ? 1 : -1;
        if (trainDir !== direction) continue;
      }
      
      // Sắp xếp tất cả schedule của tàu này theo thời gian thực tế
      const sortedSchedules = [...trainSchedules].sort((a, b) => {
        return this.getDateTime(a.date, a.departure_time).getTime() - 
               this.getDateTime(b.date, b.departure_time).getTime();
      });

      // 2. Tìm các chặng khởi đầu (firstLeg) đúng ngày user tìm
      const searchDateStr = dayStart.toISOString().split("T")[0];
      const potentialFirstLegs = sortedSchedules.filter(s => {
        const sDateStr = new Date(s.date).toISOString().split("T")[0];
        return s.route_id?._id?.toString() === firstRouteId && sDateStr === searchDateStr;
      });

      for (const firstLeg of potentialFirstLegs) {
        const currentJourney: any[] = [firstLeg];
        let lastArrival = this.getDateTime(firstLeg.date, firstLeg.arrival_time);

        // Tìm các chặng tiếp theo nối tiếp nhau
        let foundFullJourney = true;
        for (let i = 1; i < routeIds.length; i++) {
          const targetRouteId = routeIds[i];
          
          // Chặng tiếp theo phải là targetRouteId và khởi hành SAU HOẶC BẰNG khi chặng trước đến
          const nextLeg = sortedSchedules.find(s => 
            s.route_id?._id?.toString() === targetRouteId &&
            this.getDateTime(s.date, s.departure_time) >= lastArrival
          );

          if (nextLeg) {
            currentJourney.push(nextLeg);
            lastArrival = this.getDateTime(nextLeg.date, nextLeg.arrival_time);
          } else {
            foundFullJourney = false;
            break;
          }
        }

        if (!foundFullJourney) continue;

        // 3. Tính toán chỗ ngồi trống cho hành trình này
        const train = firstLeg.train_id;
        const capacity = train.capacity || 100;
        const occupiedSeatIds = new Set<string>();

        // Lặp qua tất cả booking của tàu này và xem có cái nào chồng lấn với yêu cầu của chúng ta không
        for (const schedule of trainSchedules) {
          const bookingEntries = bookingMap.get(schedule._id.toString()) || [];

          for (const bookingEntry of bookingEntries) {
            if (
              bookingEntry.depOrder == null ||
              bookingEntry.arrOrder == null ||
              !this.isJourneyOverlapping(
                depStation.station_order,
                arrStation.station_order,
                bookingEntry.depOrder,
                bookingEntry.arrOrder
              )
            ) {
              continue;
            }

            const seatIds = bookingSeatMap.get(bookingEntry.bookingId);
            if (!seatIds) continue;

            for (const seatId of seatIds) {
              occupiedSeatIds.add(seatId);
            }
          }
        }

        const availableSeats = Math.max(0, capacity - occupiedSeatIds.size);
        const distance = calculateTotalRouteDistance(routeDocs as any);
        const durationMs = lastArrival.getTime() - this.getDateTime(firstLeg.date, firstLeg.departure_time).getTime();
        const durationHours = durationMs / (1000 * 60 * 60);

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
          arrival_time: this.calculateArrivalTime(firstLeg.departure_time, durationHours),
          distance,
          duration: this.formatDurationFromHours(durationHours),
          price: calculateBaseRoutePrice(routeDocs as any),
          availableSeats,
        });
      }
    }

    if (!results.length) {
      return { trips: [], message: "Khong co chuyen phu hop" };
    }

    return {
      trips: results.slice(skip, skip + limit),
    };
  }

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
      const cacheKey = `search:${departureStation}:${arrivalStation}:${departureDate}:${
        returnDate || "oneway"
      }:${page}:${limit}:${departureStationCode || ""}:${
        arrivalStationCode || ""
      }`;
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
          message: departure.message,
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
        message: "Tim chuyen tau thanh cong",
        data: {
          departureDate,
          returnDate: returnDate || null,
          departureTrips: departure.trips,
          returnTrips,
          page,
          limit,
        },
      };

      await redisClient.set(cacheKey, JSON.stringify(resultData), { EX: 30 });

      return resultData;
    } catch (error) {
      console.error("Search error:", error);
      return {
        success: false,
        message: "Loi he thong",
      };
    }
  }
}
