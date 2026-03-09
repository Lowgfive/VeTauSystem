import { Types, Document } from "mongoose";

// Loại nhà ga Metro
export type StationType = "underground" | "elevated" | "ground";

// Interface chính cho Station (Nhà ga Metro)
export interface IStation extends Document {
  station_name: string;           // Tên ga (VD: "Quần Ngựa")
  station_code: string;           // Mã ga (VD: "L5-01")
  station_order: number;          // Thứ tự ga trên tuyến (1-20)
  station_type: StationType;      // Loại ga: ngầm / trên cao / mặt đất
  line_id: Types.ObjectId;        // Thuộc tuyến Metro nào
  location: string;               // Địa chỉ / khu vực
  lat?: number;                   // Vĩ độ GPS (optional)
  lng?: number;                   // Kinh độ GPS (optional)
  is_active: boolean;             // Ga có đang hoạt động không
}
