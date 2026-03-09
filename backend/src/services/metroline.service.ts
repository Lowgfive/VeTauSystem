import { MetroLine } from "../models/metroline.model";
import { IMetroLine } from "../types/metroline.type";
import { StationService } from "./station.service";

export class MetroLineService {
    // Tạo tuyến Metro mới
    static async createLine(data: Partial<IMetroLine>) {
        return await MetroLine.create(data);
    }

    // Lấy tất cả tuyến Metro
    static async getAllLines() {
        return await MetroLine.find({ is_active: true })
            .populate("stations", "station_name station_code station_order station_type");
    }

    // Lấy chi tiết 1 tuyến (kèm danh sách ga)
    static async getLineById(lineId: string) {
        return await MetroLine.findById(lineId)
            .populate("stations", "station_name station_code station_order station_type location");
    }

    // Lấy tuyến theo mã tuyến
    static async getLineByCode(code: string) {
        return await MetroLine.findOne({ line_code: code })
            .populate("stations", "station_name station_code station_order station_type location");
    }

    // Cập nhật tuyến
    static async updateLine(lineId: string, data: Partial<IMetroLine>) {
        return await MetroLine.findByIdAndUpdate(lineId, data, { new: true });
    }

    // Xóa tuyến (soft delete)
    static async deleteLine(lineId: string) {
        return await MetroLine.findByIdAndUpdate(lineId, { is_active: false }, { new: true });
    }

    // ── Seed tuyến 5 (Văn Cao – Hòa Lạc) kèm 20 ga ──────────────────────────
    static async seedLine5() {
        // Kiểm tra nếu đã tồn tại
        const existing = await MetroLine.findOne({ line_code: "L5" });
        if (existing) {
            return { message: "Tuyến 5 đã tồn tại", line: existing };
        }

        // Tạo tuyến trước
        const line = await MetroLine.create({
            line_name: "Tuyến 5 - Văn Cao – Hòa Lạc",
            line_code: "L5",
            stations: [],
            total_distance: 39.6,
            total_stations: 20,
            operating_hours: { start: "05:30", end: "23:00" },
            frequency_minutes: 5,
            is_active: true,
        });

        // Seed 20 ga và gán vào tuyến
        const stations = await StationService.seedLine5Stations(line._id.toString());
        const stationIds = stations.map((s) => s._id);

        // Cập nhật lại tuyến với danh sách ga
        line.stations = stationIds;
        await line.save();

        return { message: "Đã seed tuyến 5 với 20 nhà ga", line, stations };
    }
}
