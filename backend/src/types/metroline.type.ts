import { Types, Document } from "mongoose";

// Interface chính cho MetroLine (Tuyến Metro)
export interface IMetroLine extends Document {
    line_name: string;              // Tên tuyến (VD: "Tuyến 5 - Văn Cao – Hòa Lạc")
    line_code: string;              // Mã tuyến (VD: "L5")
    stations: Types.ObjectId[];     // Mảng stationId theo thứ tự ga
    total_distance: number;         // Tổng chiều dài tuyến (km)
    total_stations: number;         // Tổng số ga
    operating_hours: {              // Giờ hoạt động
        start: string;                // VD: "05:30"
        end: string;                  // VD: "23:00"
    };
    frequency_minutes: number;      // Tần suất chạy (phút/chuyến)
    is_active: boolean;             // Tuyến có đang hoạt động không
}
