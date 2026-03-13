import { Types, Document } from "mongoose";

// Interface chính cho Line (Tuyến đường sắt)
export interface ILine extends Document {
    line_name: string;              // Tên tuyến (VD: "Tuyến Bắc Nam")
    line_code: string;              // Mã tuyến (VD: "NS")
    stations: Types.ObjectId[];     // Mảng stationId theo thứ tự ga
    total_distance: number;         // Tổng chiều dài tuyến (km)
    total_stations: number;         // Tổng số ga
    is_active: boolean;             // Tuyến có đang hoạt động không
}
