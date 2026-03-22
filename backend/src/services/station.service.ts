import { Station } from "../models/station.model";
import { Route } from "../models/route.model";
import { IStation } from "../types/station.type";

export class StationService {
  /**
   * Tạo ga mới
   * @param data Dữ liệu ga (tên, mã, thứ tự, vị trí)
   */
  static async createStation(data: Partial<IStation>) {
    // Kiểm tra mã ga hoặc tên ga đã tồn tại (dù Mongo có unique index, vẫn nên check để trả về error rõ ràng)
    const existingStation = await Station.findOne({
      $or: [{ station_code: data.station_code }, { station_name: data.station_name }],
    });

    if (existingStation) {
      throw new Error("Mã ga hoặc tên ga đã tồn tại trong hệ thống");
    }

    return await Station.create(data);
  }

  /**
   * Lấy tất cả ga trong hệ thống
   */
  static async getAllStations() {
    return await Station.find({ is_active: { $ne: false } })
      .sort({ station_order: 1 });
  }

  /**
   * Lấy chi tiết một ga theo mã ga
   * @param code Mã ga (VD: "HN")
   */
  static async getStationByCode(code: string) {
    return await Station.findOne({ station_code: code, is_active: { $ne: false } });
  }

  /**
   * Cập nhật thông tin ga
   * @param stationId ID nhà ga
   * @param data Dữ liệu cập nhật
   */
  static async updateStation(stationId: string, data: Partial<IStation>) {
    // Nếu cập nhật mã/tên, kiểm tra xem có trùng với ga khác không
    if (data.station_code || data.station_name) {
      const existingStation = await Station.findOne({
        _id: { $ne: stationId },
        $or: [
          { station_code: data.station_code },
          { station_name: data.station_name },
        ],
      });

      if (existingStation) {
        throw new Error("Mã ga hoặc tên ga đã tồn tại ở một bản ghi khác");
      }
    }

    return await Station.findByIdAndUpdate(stationId, data, { new: true });
  }

  /**
   * Xóa ga (Soft delete)
   * @param stationId ID nhà ga
   */
  static async deleteStation(stationId: string) {
    // Kiểm tra xem ga có đang được sử dụng trong Route (tuyến đường) nào không
    const isUsedInRoute = await Route.findOne({
      $or: [
        { departure_station_id: stationId },
        { arrival_station_id: stationId },
      ],
    });

    if (isUsedInRoute) {
      throw new Error("Không thể xóa ga vì ga đang được sử dụng trong một hoặc nhiều tuyến đường sắt");
    }

    return await Station.findByIdAndUpdate(stationId, { is_active: false }, { new: true });
  }
}
