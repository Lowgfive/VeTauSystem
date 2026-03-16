import { Station } from "../models/station.model";
import { IStation } from "../types/station.type";

export class StationService {
  /**
   * Tạo ga mới
   * @param data Dữ liệu ga (tên, mã, thứ tự, vị trí)
   */
  static async createStation(data: Partial<IStation>) {
    return await Station.create(data);
  }

  /**
   * Lấy tất cả ga trong hệ thống
   */
  static async getAllStations() {
    return await Station.find({ is_active: true })
      .sort({ station_order: 1 });
  }

  /**
   * Lấy chi tiết một ga theo mã ga
   * @param code Mã ga (VD: "HN")
   */
  static async getStationByCode(code: string) {
    return await Station.findOne({ station_code: code, is_active: true });
  }

  /**
   * Cập nhật thông tin ga
   * @param stationId ID nhà ga
   * @param data Dữ liệu cập nhật
   */
  static async updateStation(stationId: string, data: Partial<IStation>) {
    return await Station.findByIdAndUpdate(stationId, data, { new: true });
  }

  /**
   * Xóa ga (Soft delete)
   * @param stationId ID nhà ga
   */
  static async deleteStation(stationId: string) {
    return await Station.findByIdAndUpdate(stationId, { is_active: false }, { new: true });
  }
}
