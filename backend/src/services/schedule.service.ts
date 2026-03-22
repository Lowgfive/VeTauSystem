import { Schedule } from "../models/schedule.model";
import { Train } from "../models/train.model";
import { Route } from "../models/route.model";
import { Station } from "../models/station.model";
import mongoose from "mongoose";
import BookingModel from "../models/booking.model";
import { BookingPassenger } from "../models/bookingpassenger.model";
import { getSeatsByTrain } from "../services/train.service";
import * as seatLockService from "../services/seat.service";
function formatTime(date: Date) {
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}



export default class ScheduleService {

  static async generateSchedules(trainId: string, days: number) {

    const train = await Train.findById(trainId);
    if (!train) throw new Error("Train not found");

    const now = new Date();

    await Schedule.deleteMany({
      train_id: trainId,
      date: {
        $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate())
      },
      status: "SCHEDULED"
    });

    const stations = await Station.find().sort({ station_order: 1 });
    const routes = await Route.find();

    // map route
    const routeMap = new Map();
    routes.forEach(r => {
      const key =
        r.departure_station_id.toString() +
        "-" +
        r.arrival_station_id.toString();
      routeMap.set(key, r);
    });

    const schedules: any[] = [];

    for (let day = 0; day < days; day++) {

      // 🟢 reset mỗi ngày
      let currentTime = new Date();
      currentTime.setHours(8, 0, 0, 0);
      currentTime.setDate(currentTime.getDate() + day);

      let stationIndex =
        train.direction === "forward" ? 0 : stations.length - 1;

      const direction = train.direction;

      while (true) {

        const nextIndex =
          direction === "forward"
            ? stationIndex + 1
            : stationIndex - 1;

        // 🔥 tới ga cuối → dừng (KHÔNG đảo chiều)
        if (nextIndex < 0 || nextIndex >= stations.length) {
          break;
        }

        const currentStation = stations[stationIndex];
        const nextStation = stations[nextIndex];

        const routeKey =
          currentStation._id.toString() +
          "-" +
          nextStation._id.toString();

        const route = routeMap.get(routeKey);

        if (!route) {
          console.error(
            `Thiếu route: ${currentStation.station_name} -> ${nextStation.station_name}`
          );
          break;
        }

        const departureDate = new Date(currentTime);

        const travelMs = route.hour * 60 * 60 * 1000;

        const arrivalDate = new Date(
          departureDate.getTime() + travelMs
        );

        schedules.push({
          train_id: train._id,
          route_id: route._id,

          // 🔥 QUAN TRỌNG: date = ngày KHỞI HÀNH của segment
          date: new Date(
            departureDate.getFullYear(),
            departureDate.getMonth(),
            departureDate.getDate()
          ),

          departure_time: formatTime(departureDate),
          arrival_time: formatTime(arrivalDate)
        });

        // dừng 30 phút
        currentTime = new Date(
          arrivalDate.getTime() + 30 * 60 * 1000
        );

        stationIndex = nextIndex;
      }
    }

    await Schedule.insertMany(schedules);

    return schedules.length;
  }
  // --- MỚI THÊM VÀO ĐỂ FIX API MAIN BRANCH ---
  static async getAllSchedules(filter: Record<string, any> = {}, limit?: number) {
    let query = Schedule.find(filter)
      .select("_id date departure_time arrival_time train_id route_id status")
      .populate({ path: "train_id", select: "_id train_code train_name" })
      .populate({
        path: "route_id",
        select: "departure_station_id arrival_station_id",
        populate: [
          { path: "departure_station_id", select: "_id station_name" },
          { path: "arrival_station_id", select: "_id station_name" }
        ]
      })
      .sort({ date: 1, departure_time: 1 });
    if (limit && limit > 0) query = query.limit(limit);
    return query;
  }

  static async updateSchedule(id: string, updateData: Partial<typeof Schedule>) {
    const updated = await Schedule.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    if (!updated) {
      throw new Error("Không tìm thấy chuyến tàu (Schedule not found)");
    }
    return updated;
  }

  static async getSeatsBySchedule(id: string) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("ID lịch trình không hợp lệ");
    }

    const schedule = await Schedule.findById(id).populate("train_id").lean();
    if (!schedule) {
      throw new Error("Không tìm thấy lịch trình");
    }

    const train: any = (schedule as any).train_id;
    if (!train?._id) {
      throw new Error("Lịch trình không gắn với đoàn tàu hợp lệ");
    }

    // Lấy ghế cơ bản của tàu
    const baseSeatMap = await getSeatsByTrain(String(train._id));
    if (!baseSeatMap || !baseSeatMap.seatsByCarriage) {
      return { scheduleId: id, seats: [] };
    }

    const allSeats: any[] = Object.values(baseSeatMap.seatsByCarriage || {}).flat();

    // Lấy các ghế đã đặt theo lịch trình
    const bookings = await BookingModel.find({
      schedule_id: new mongoose.Types.ObjectId(id),
      status: { $in: ["pending", "confirmed", "paid", "changed"] },
    }).select("_id").lean();

    const bookingIds = bookings.map((b) => b._id);

    const bookingPassengers = await BookingPassenger.find({
      booking_id: { $in: bookingIds },
      status: { $in: ["reserved", "confirmed", "paid"] }
    }).select("seat_id seatInfo").populate('seat_id').lean();

    const bookedSeatIds = new Set<string>(bookingPassengers.map((bp: any) => String(bp.seat_id?._id || bp.seat_id)));

    // Fallback cho logic lấy bằng seat_number
    const bookedSeatNumbers = new Set<string>(
      bookingPassengers.map((bp: any) => String(bp.seatInfo?.seatNumber || bp.seat_id?.seat_number)).filter(Boolean)
    );

    // Lấy danh sách ghế đang bị lock
    const seatIds = allSeats.map((s: any) => String(s._id));
    const lockMap = await seatLockService.checkSeatLocksBulk(id, seatIds);

    const seats = allSeats.map((seat: any) => {
      const seatNumber = String(seat.seat_number);
      const seatId = String(seat._id);
      const isBooked = bookedSeatIds.has(seatId) || bookedSeatNumbers.has(seatNumber);
      const isLocked = !isBooked && !!lockMap[seatId];

      return {
        seatNumber,
        seatId,
        carriageId: String(seat.carriage_id),
        seatType: seat.seat_type,
        status: isBooked ? "booked" : isLocked ? "locked" : "available",
      };
    });

    return { scheduleId: id, seats };
  }
}
