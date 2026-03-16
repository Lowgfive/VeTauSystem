
import { Types, Document } from "mongoose";

// Loại đoàn tàu (phân loại theo số toa)
export type TrainType = "4-car" | "6-car" | "8-car";

// Interface chính cho Train (Đoàn tàu)
export interface ITrain extends Document {
  train_name: string;           // Tên đoàn tàu (VD: "Tàu L5-001")
  train_code: string;           // Mã tàu duy nhất (VD: "T5-001")
  train_type?: TrainType;        // Loại đoàn tàu: 4/6/8 toa
  total_carriages?: number;      // Tổng số toa trong đoàn
  capacity?: number;             // Sức chứa tối đa (ngồi + đứng)
  max_speed?: number;            // Tốc độ tối đa (km/h)
  amenities?: string[];          // Tiện ích trên tàu (wifi, điều hòa...)
  is_active?: boolean;           // Tàu có đang hoạt động không
  template_id?: Types.ObjectId;
  direction?: "forward" | "backward";
  status?: "active" | "inactive";
}
