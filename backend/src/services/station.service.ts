import { Station } from "../models/station.model";
import { Line } from "../models/line.model";
import { IStation } from "../types/station.type";

export class StationService {
  /**
   * Tạo ga mới
   * @param data Dữ liệu ga (tên, mã, thứ tự, loại ga, line_id)
   */
  static async createStation(data: Partial<IStation>) {
    return await Station.create(data);
  }

  /**
   * Lấy tất cả ga trong hệ thống
   * Populate thông tin tuyến (Line) đi kèm
   */
  static async getAllStations() {
    return await Station.find({ is_active: true })
      .populate("line_id", "line_name line_code")
      .sort({ line_id: 1, station_order: 1 });
  }

  /**
   * Lấy chi tiết một ga theo mã ga
   * @param code Mã ga (VD: "L5-01")
   */
  static async getStationByCode(code: string) {
    return await Station.findOne({ station_code: code, is_active: true })
      .populate("line_id", "line_name line_code");
  }

  /**
   * Lấy danh sách ga thuộc một tuyến cụ thể
   * @param lineId ID của tuyến
   */
  static async getStationsByLine(lineId: string) {
    return await Station.find({ line_id: lineId, is_active: true })
      .sort({ station_order: 1 });
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
