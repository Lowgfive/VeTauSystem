import { Station } from "../models/station.model";
import { Route } from "../models/route.model";
import { Schedule } from "../models/schedule.model";

export class SearchService {
  static async searchTrips(
    departureCode: string,
    arrivalCode: string,
    date: string
  ) {
    try {
      // 1️⃣ Tìm ga
      const departureStation = await Station.findOne({ code: departureCode });
      const arrivalStation = await Station.findOne({ code: arrivalCode });

      if (!departureStation || !arrivalStation) {
        return { success: false, message: "Không tìm thấy ga" };
      }

      // 2️⃣ Tìm tất cả route có chứa 2 ga
      const routes = await Route.find({
        stations: {
          $all: [departureStation._id, arrivalStation._id],
        },
      });

      if (routes.length === 0) {
        return { success: false, message: "Không có tuyến phù hợp" };
      }

      // 3️⃣ Lọc route đúng chiều (ga đi phải đứng trước ga đến)
      const validRoutes = routes.filter((route) => {
        // @ts-ignore
        const depIndex = route.stations.indexOf(departureStation._id);
        // @ts-ignore
        const arrIndex = route.stations.indexOf(arrivalStation._id);

        return depIndex !== -1 && arrIndex !== -1 && depIndex < arrIndex;
      });

      if (validRoutes.length === 0) {
        return { success: false, message: "Không có tuyến đúng chiều" };
      }

      // 4️⃣ Lọc theo ngày
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      // 5️⃣ Tìm schedule của các route hợp lệ
      const schedules = await Schedule.find({
        // @ts-ignore
        route_id: { $in: validRoutes.map((r) => r._id) },
        departure_time: {
          $gte: startDate,
          $lte: endDate,
        },
      }).populate("train_id");

      if (schedules.length === 0) {
        return { success: false, message: "Không có chuyến trong ngày" };
      }

      return {
        success: true,
        data: schedules,
      };
    } catch (err) {
      console.error(err);
      return { success: false, message: "Lỗi hệ thống" };
    }
  }
}


