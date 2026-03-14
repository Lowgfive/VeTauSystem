import mongoose from "mongoose";
import { ISchedule } from "../types/schedule.type";
import { Schedule } from "../models/schedule.model";
import { Route } from "../models/route.model";
import { Train } from "../models/train.model";
import { Station } from "../models/station.model";

const TURNAROUND_TIME_MINUTES = 30;
const MINUTES_PER_DAY = 24 * 60;

function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToHHMM(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  return `${h.toString().padStart(2, "0")}:${m
    .toString()
    .padStart(2, "0")}`;
}

function addMinutes(date: Date, time: string, add: number) {
  const baseMinutes = parseTimeToMinutes(time) + add;

  const days = Math.floor(baseMinutes / MINUTES_PER_DAY);
  const minutesOfDay = baseMinutes % MINUTES_PER_DAY;

  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);

  return {
    date: newDate,
    time: minutesToHHMM(minutesOfDay),
  };
}

export class ScheduleService {
  static async generateSchedules(
    trainId: string,
    maxDays: number = 30
  ) {
    if (!mongoose.Types.ObjectId.isValid(trainId)) {
      throw new Error("Invalid train id");
    }

    const train = await Train.findById(trainId).select("direction status");

    if (!train || train.status !== "active") {
      throw new Error("Train not active or not found");
    }

    const createdSchedules: any[] = [];

    // Load toàn bộ station theo thứ tự một lần
    const stations = await Station.find().sort({ station_order: 1 }).lean();

    if (stations.length < 2) {
      throw new Error("Not enough stations to generate schedules");
    }

    // Lấy schedule mới nhất
    let latestSchedule = await Schedule.findOne({
      train_id: trainId,
    }).sort({ date: -1, arrival_time: -1 });

    let direction: "forward" | "backward" = train.direction as
      | "forward"
      | "backward";

    // Nếu chưa có schedule → tạo chuyến đầu
    if (!latestSchedule) {
      let firstStation: any;
      let secondStation: any;

      if (direction === "forward") {
        firstStation = stations[0];
        secondStation = stations[1];
      } else {
        firstStation = stations[stations.length - 1];
        secondStation = stations[stations.length - 2];
      }

      const route = await Route.findOne({
        departure_station_id: firstStation._id,
        arrival_station_id: secondStation._id,
      });

      if (!route) {
        throw new Error("Route not found for first segment");
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const departure_time = "08:00";

      const arrival = addMinutes(today, departure_time, route.hour * 60);

      latestSchedule = await Schedule.create({
        route_id: route._id,
        train_id: trainId,
        date: arrival.date,
        departure_time,
        arrival_time: arrival.time,
      });

      createdSchedules.push(latestSchedule);
    }

    if (!latestSchedule) {
      // Type guard – thực tế nhánh này không xảy ra vì đã xử lý ở trên,
      // nhưng thêm để TS yên tâm.
      throw new Error("Failed to initialize first schedule");
    }

    const startDate = new Date(latestSchedule.date as Date);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + maxDays);

    while ((latestSchedule!.date as Date) < endDate) {
      const route: any = await Route.findById(
        latestSchedule!.route_id as mongoose.Types.ObjectId
      ).lean();

      if (!route) break;

      const arrivalStation: any = stations.find((s) => {
        const sid = (s._id as mongoose.Types.ObjectId).toString();
        const rid = (
          route.arrival_station_id as mongoose.Types.ObjectId
        ).toString();
        return sid === rid;
      });

      if (!arrivalStation) break;

      let step = direction === "forward" ? 1 : -1;

      let nextStation = stations.find(
        (s) => s.station_order === arrivalStation.station_order + step
      );

      if (!nextStation) {
        direction = direction === "forward" ? "backward" : "forward";

        step = -step;

        nextStation = stations.find(
          (s) => s.station_order === arrivalStation.station_order + step
        );

        await Train.updateOne({ _id: trainId }, { direction });
      }

      if (!nextStation) break;

      const nextRoute: any = await Route.findOne({
        departure_station_id: arrivalStation._id,
        arrival_station_id: nextStation._id,
      }).lean();

      if (!nextRoute) break;

      const departure = addMinutes(
        latestSchedule!.date as Date,
        (latestSchedule as any).arrival_time as string,
        TURNAROUND_TIME_MINUTES
      );

      const arrival = addMinutes(
        departure.date,
        departure.time,
        nextRoute.hour * 60
      );

      const newSchedule: any = await Schedule.create({
        route_id: nextRoute._id,
        train_id: trainId,
        date: arrival.date,
        departure_time: departure.time,
        arrival_time: arrival.time,
      });

      createdSchedules.push(newSchedule);

      latestSchedule = newSchedule;
    }

    return {
      success: true,
      message: `Generated ${createdSchedules.length} schedules`,
      data: createdSchedules,
    };
  }
}