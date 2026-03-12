import mongoose from "mongoose";
import { Schedule } from "../models/schedule.model";
import { Route } from "../models/route.model";
import { Train } from "../models/train.model";
import { Station } from "../models/station.model";

// Thời gian quay đầu mặc định (phút) sau khi tàu đến ga cuối
const TURNAROUND_TIME_MINUTES = 30;
const MINUTES_PER_DAY = 24 * 60;

// Chuyển chuỗi "HH:mm" → tổng số phút trong ngày
function parseTimeToMinutes(time: string): number {
  const [hourStr, minuteStr] = time.split(":");
  const hours = parseInt(hourStr, 10);
  const minutes = parseInt(minuteStr, 10);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    throw new Error("Invalid time format, expected HH:mm");
  }

  return hours * 60 + minutes;
}

// Cộng phút vào (ngày + thời điểm trong ngày) và trả về ngày mới + chuỗi "HH:mm"
function addMinutesToDate(
  baseDate: Date,
  baseTimeMinutes: number,
  deltaMinutes: number
): { date: Date; time: string } {
  const totalMinutes = baseTimeMinutes + deltaMinutes;

  const daysToAdd = Math.floor(totalMinutes / MINUTES_PER_DAY);
  const minutesOfDay =
    ((totalMinutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;

  const resultDate = new Date(baseDate);
  resultDate.setDate(resultDate.getDate() + daysToAdd);

  const hours = Math.floor(minutesOfDay / 60);
  const minutes = minutesOfDay % 60;

  const time = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;

  return { date: resultDate, time };
}

export class ScheduleService {
  /**
   * Tạo schedule đầu tiên cho 1 tàu (nếu chưa có),
   * lấy ngày hôm nay làm ngày chạy.
   */
  static async createFirstScheduleForTrain(trainId: string) {
    const train = await Train.findById(trainId).select("direction");
    if (!train) {
      throw new Error("Train not found");
    }

    // Xác định hướng và ga xuất phát ban đầu
    let direction: "forward" | "backward" = train.direction as "forward" | "backward";
    const startOrder = direction === "forward" ? 1 : 15;
    const step = direction === "forward" ? 1 : -1;

    const departureStation = await Station.findOne({
      station_order: startOrder,
    });
    const arrivalStation = await Station.findOne({
      station_order: startOrder + step,
    });

    if (!departureStation || !arrivalStation) {
      throw new Error("No stations found for initial schedule");
    }

    const route = await Route.findOne({
      departure_station_id: departureStation._id,
      arrival_station_id: arrivalStation._id,
    });

    if (!route) {
      throw new Error("No route found for initial schedule");
    }

    // Ngày hôm nay (chỉ lấy phần date, không lấy giờ)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Giờ xuất phát mặc định trong ngày (có thể chỉnh nếu cần)
    const defaultDepartureTime = "08:00";
    const routeDurationMinutes = (route.hour ?? 0) * 60;

    const { date, time: arrival_time } = addMinutesToDate(
      today,
      parseTimeToMinutes(defaultDepartureTime),
      routeDurationMinutes
    );

    const newSchedule = await Schedule.create({
      route_id: route._id,
      train_id: new mongoose.Types.ObjectId(trainId),
      date,
      departure_time: defaultDepartureTime,
      arrival_time,
    });

    return newSchedule;
  }

  /**
   * Tự động sinh Schedule tiếp theo cho 1 tàu dựa trên:
   * - Schedule gần nhất (theo date + arrival_time)
   * - Ga đến hiện tại (arrival_station_id của Route)
   * - Route tiếp theo bắt đầu từ ga đó
   * - Thời gian quay đầu + thời lượng tuyến (route.hour)
   */
  static async autoGenerateNextSchedule(trainId: string) {
    if (!mongoose.Types.ObjectId.isValid(trainId)) {
      throw new Error("Invalid train id");
    }

    // Lấy thông tin tàu (bao gồm hướng đi)
    const train = await Train.findById(trainId).select("direction");
    if (!train) {
      throw new Error("Train not found");
    }

    // 1. Lấy schedule mới nhất của tàu
    const latestSchedule = await Schedule.findOne({ train_id: trainId })
      .sort({ date: -1, arrival_time: -1 })
      .populate({
        path: "route_id",
        populate: {
          path: "arrival_station_id",
        },
      });

    // Nếu chưa có schedule nào thì tạo schedule đầu tiên (ngày hôm nay)
    if (!latestSchedule) {
      return this.createFirstScheduleForTrain(trainId);
    }

    const route: any = latestSchedule.route_id;
    if (!route || !route.arrival_station_id) {
      throw new Error("Latest schedule route is invalid");
    }

    const arrivalStation: any = route.arrival_station_id;
    if (
      !arrivalStation ||
      typeof arrivalStation.station_order !== "number"
    ) {
      throw new Error("Arrival station is invalid");
    }

    // 2. Xác định ga kế tiếp dựa trên direction + station_order
    let direction: "forward" | "backward" = train.direction as "forward" | "backward";
    let step = direction === "forward" ? 1 : -1;

    let nextStation = await Station.findOne({
      station_order: arrivalStation.station_order + step,
    });

    // Nếu đang ở cuối tuyến, đảo chiều và tìm lại
    if (!nextStation) {
      direction = direction === "forward" ? "backward" : "forward";
      step = -step;

      nextStation = await Station.findOne({
        station_order: arrivalStation.station_order + step,
      });

      if (!nextStation) {
        throw new Error("No next station found for train");
      }

      // Cập nhật lại hướng đi của tàu trong DB
      await Train.updateOne({ _id: train._id }, { direction });
    }

    // 3. Tìm route giữa ga hiện tại và ga kế tiếp
    const nextRoute = await Route.findOne({
      departure_station_id: arrivalStation._id,
      arrival_station_id: nextStation._id,
    });

    if (!nextRoute) {
      throw new Error("No route found between current and next station");
    }

    // 4. Tính thời gian xuất phát mới (arrival + turnaround)
    const baseDate = new Date(latestSchedule.date);
    const arrivalMinutes = parseTimeToMinutes(latestSchedule.arrival_time);

    const { date: departureDate, time: departure_time } = addMinutesToDate(
      baseDate,
      arrivalMinutes,
      TURNAROUND_TIME_MINUTES
    );

    // 5. Tính thời gian đến mới dựa trên thời lượng tuyến (hour → phút)
    const routeDurationMinutes = (nextRoute.hour ?? 0) * 60;
    const { date, time: arrival_time } = addMinutesToDate(
      departureDate,
      parseTimeToMinutes(departure_time),
      routeDurationMinutes
    );

    // 6. Lưu schedule mới
    const newSchedule = await Schedule.create({
      route_id: nextRoute._id,
      train_id: new mongoose.Types.ObjectId(trainId),
      date,
      departure_time,
      arrival_time,
    });

    return newSchedule;
  }

  /**
   * Sinh nhiều schedule liên tiếp cho 1 tàu,
   * dừng lại khi đã vượt qua 1 ngày (so với chuyến đầu tiên) hoặc đạt giới hạn an toàn.
   */
  static async autoGenerateSchedulesForOneDay(trainId: string) {
    const createdSchedules = [];

    // Tạo chuyến đầu tiên
    const firstSchedule = await this.autoGenerateNextSchedule(trainId);
    createdSchedules.push(firstSchedule);

    const startDate = new Date(firstSchedule.date);
    startDate.setHours(0, 0, 0, 0);

    // Giới hạn an toàn để tránh loop vô hạn nếu dữ liệu bất thường
    const MAX_ITERATION = 50;

    for (let i = 0; i < MAX_ITERATION; i++) {
      const nextSchedule = await this.autoGenerateNextSchedule(trainId);
      createdSchedules.push(nextSchedule);

      const nextDate = new Date(nextSchedule.date);
      nextDate.setHours(0, 0, 0, 0);

      const diffMs = nextDate.getTime() - startDate.getTime();
      const diffDays = diffMs / (24 * 60 * 60 * 1000);

      // Nếu đã sang ngày mới (>= 1 ngày chênh lệch) thì dừng
      if (diffDays >= 1) {
        break;
      }
    }

    return createdSchedules;
  }
}

