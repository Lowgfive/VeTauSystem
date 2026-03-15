import { Line } from "../models/line.model";
import { ILine } from "../types/line.type";

export class LineService {
    /**
     * Tạo tuyến mới
     * @param data Dữ liệu tuyến (tên, mã, khoảng cách, số ga)
     */
    static async createLine(data: Partial<ILine>) {
        return await Line.create(data);
    }

    /**
     * Lấy tất cả tuyến trong hệ thống
     */
    static async getAllLines() {
        return await Line.find({ is_active: true })
            .populate("stations")
            .sort({ line_code: 1 });
    }

    /**
     * Lấy chi tiết một tuyến theo ID
     * @param lineId ID của tuyến
     */
    static async getLineById(lineId: string) {
        return await Line.findById(lineId).populate("stations");
    }

    /**
     * Cập nhật thông tin tuyến
     * @param lineId ID tuyến
     * @param data Dữ liệu cập nhật
     */
    static async updateLine(lineId: string, data: Partial<ILine>) {
        return await Line.findByIdAndUpdate(lineId, data, { new: true });
    }

    /**
     * Xóa tuyến (Soft delete)
     * @param lineId ID tuyến
     */
    static async deleteLine(lineId: string) {
        return await Line.findByIdAndUpdate(lineId, { is_active: false }, { new: true });
    }
}

