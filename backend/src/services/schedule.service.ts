import {Schedule} from "../models/schedule.model";
import {Train} from "../models/train.model";
import {Route} from "../models/route.model";
import {Station} from "../models/station.model";
  function formatTime(date: Date) {
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}



export default class ScheduleService {

  static async generateSchedules(trainId: string, days = 10) {

    const train = await Train.findById(trainId);
    if (!train) throw new Error("Train not found");

    const stations = await Station.find().sort({ station_order: 1 });
    const routes = await Route.find();

    // map route lookup nhanh
    const routeMap = new Map();
    routes.forEach(r => {
      const key =
        r.departure_station_id.toString() +
        "-" +
        r.arrival_station_id.toString();

      routeMap.set(key, r);
    });

    let direction = train.direction;

    let stationIndex =
      direction === "forward" ? 0 : stations.length - 1;

    const startDate = new Date();
    startDate.setHours(8, 0, 0, 0); // tàu chạy 8h sáng

    let currentTime = new Date(startDate);

    const endDate = new Date(
      startDate.getTime() + days * 24 * 60 * 60 * 1000
    );

    const schedules: any[] = [];

    while (currentTime < endDate) {

      const nextIndex =
        direction === "forward"
          ? stationIndex + 1
          : stationIndex - 1;

      // đảo chiều khi tới ga cuối
      if (nextIndex < 0 || nextIndex >= stations.length) {

        direction = direction === "forward"
          ? "backward"
          : "forward";

        continue;
      }

      const currentStation = stations[stationIndex];
      const nextStation = stations[nextIndex];

      const routeKey =
        currentStation._id.toString() +
        "-" +
        nextStation._id.toString();

      const route = routeMap.get(routeKey);

      if (!route) {
        console.log("missing route", routeKey);
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

        date: new Date(
          departureDate.getFullYear(),
          departureDate.getMonth(),
          departureDate.getDate()
        ),

        departure_time: formatTime(departureDate),
        arrival_time: formatTime(arrivalDate)
      });

      // tàu dừng 30 phút
      currentTime = new Date(
        arrivalDate.getTime() + 30 * 60 * 1000
      );

      stationIndex = nextIndex;
    }

    await Schedule.insertMany(schedules);

    console.log(schedules)
    return schedules.length;
  }
}
