import { Station } from "../models/station.model";
import { IStation } from "../types/station.type";

export class StationService {
  // Tạo ga mới
  static async createStation(data: Partial<IStation>) {
    return await Station.create(data);
  }

  // Lấy tất cả ga
  static async getAllStations() {
    return await Station.find({ is_active: true })
      .populate("line_id", "line_name line_code")
      .sort({ station_order: 1 });
  }

  // Lấy ga theo mã ga
  static async getStationByCode(code: string) {
    return await Station.findOne({ station_code: code })
      .populate("line_id", "line_name line_code");
  }

  // Lấy tất cả ga theo tuyến
  static async getStationsByLine(lineId: string) {
    return await Station.find({ line_id: lineId, is_active: true })
      .sort({ station_order: 1 });
  }

  // Cập nhật ga
  static async updateStation(stationId: string, data: Partial<IStation>) {
    return await Station.findByIdAndUpdate(stationId, data, { new: true });
  }

  // Seed data 20 ga tuyến 5 (Văn Cao – Hòa Lạc)
  static async seedLine5Stations(lineId: string) {
    const stations = [
      { station_name: "Quần Ngựa", station_code: "L5-01", station_order: 1, station_type: "underground" as const, location: "Ba Đình, Hà Nội" },
      { station_name: "Kim Mã", station_code: "L5-02", station_order: 2, station_type: "underground" as const, location: "Ba Đình, Hà Nội" },
      { station_name: "Vành đai 1", station_code: "L5-03", station_order: 3, station_type: "underground" as const, location: "Đống Đa, Hà Nội" },
      { station_name: "Vành đai 2", station_code: "L5-04", station_order: 4, station_type: "underground" as const, location: "Cầu Giấy, Hà Nội" },
      { station_name: "Hoàng Đạo Thúy", station_code: "L5-05", station_order: 5, station_type: "underground" as const, location: "Cầu Giấy, Hà Nội" },
      { station_name: "Vành đai 3", station_code: "L5-06", station_order: 6, station_type: "underground" as const, location: "Cầu Giấy, Hà Nội" },
      { station_name: "Lê Đức Thọ", station_code: "L5-07", station_order: 7, station_type: "underground" as const, location: "Nam Từ Liêm, Hà Nội" },
      { station_name: "Mễ Trì", station_code: "L5-08", station_order: 8, station_type: "elevated" as const, location: "Nam Từ Liêm, Hà Nội" },
      { station_name: "Tây Mỗ", station_code: "L5-09", station_order: 9, station_type: "elevated" as const, location: "Nam Từ Liêm, Hà Nội" },
      { station_name: "An Khánh 1", station_code: "L5-10", station_order: 10, station_type: "elevated" as const, location: "Hoài Đức, Hà Nội" },
      { station_name: "An Khánh 2", station_code: "L5-11", station_order: 11, station_type: "elevated" as const, location: "Hoài Đức, Hà Nội" },
      { station_name: "Song Phương", station_code: "L5-12", station_order: 12, station_type: "elevated" as const, location: "Hoài Đức, Hà Nội" },
      { station_name: "Sài Sơn", station_code: "L5-13", station_order: 13, station_type: "elevated" as const, location: "Quốc Oai, Hà Nội" },
      { station_name: "Quốc Oai", station_code: "L5-14", station_order: 14, station_type: "elevated" as const, location: "Quốc Oai, Hà Nội" },
      { station_name: "Đồng Bụt", station_code: "L5-15", station_order: 15, station_type: "elevated" as const, location: "Quốc Oai, Hà Nội" },
      { station_name: "Đồng Trúc", station_code: "L5-16", station_order: 16, station_type: "ground" as const, location: "Thạch Thất, Hà Nội" },
      { station_name: "Đồng Bãi", station_code: "L5-17", station_order: 17, station_type: "ground" as const, location: "Thạch Thất, Hà Nội" },
      { station_name: "Tiến Xuân", station_code: "L5-18", station_order: 18, station_type: "ground" as const, location: "Thạch Thất, Hà Nội" },
      { station_name: "Trại Mới", station_code: "L5-19", station_order: 19, station_type: "ground" as const, location: "Thạch Thất, Hà Nội" },
      { station_name: "Thạch Bình (Hòa Lạc)", station_code: "L5-20", station_order: 20, station_type: "ground" as const, location: "Thạch Thất, Hà Nội" },
    ];

    const createdStations = [];
    for (const stationData of stations) {
      // Kiểm tra nếu ga đã tồn tại thì bỏ qua
      const existing = await Station.findOne({ station_code: stationData.station_code });
      if (!existing) {
        const station = await Station.create({
          ...stationData,
          line_id: lineId,
          is_active: true,
        });
        createdStations.push(station);
      } else {
        createdStations.push(existing);
      }
    }

    return createdStations;
  }
}
