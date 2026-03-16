import { Request, Response } from "express";
import mongoose from "mongoose";
import ScheduleService from "../services/schedule.service";
import BookingModel from "../models/booking.model";
import { Schedule } from "../models/schedule.model";
import { getSeatsByTrain } from "../services/train.service";


export const autoGenSchedule = async (req: Request, res: Response) => {
  try {
    const maxDay = 30; // Tăng lên 30 ngày theo yêu cầu UI
    const { trainId } = req.body;

    if (!trainId) {
      return res.status(400).json({ success: false, message: "Thiếu ID đoàn tàu (trainId)" });
    }

    const count = await ScheduleService.generateSchedules(trainId, maxDay);
    return res.status(200).json({
      success: true,
      message: `Đã khởi tạo thành công ${count} chuyến tàu cho 30 ngày tới`,
      data: { count }
    });
  } catch (error: any) {
    console.error("Lỗi autoGenSchedule:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Lỗi máy chủ khi tự động tạo lịch trình"
    });
  }
}

export const getSchedules = async (req: Request, res: Response) => {
  try {
    const { trainId } = req.query;
    const filter: Record<string, any> = {};

    if (typeof trainId === "string") {
      filter.train_id = trainId;
    }

    const schedules = await ScheduleService.getAllSchedules(filter);
    return res.status(200).json({ success: true, data: schedules });
  } catch (error: any) {
    console.error("Lỗi getSchedules:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSchedule = async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const updateData = req.body;

    // Validate
    if (!id) return res.status(400).json({ success: false, message: "ID lịch trình bị thiếu" });

    const updated = await ScheduleService.updateSchedule(id, updateData);
    return res.status(200).json({ success: true, message: "Cập nhật thành công", data: updated });
  } catch (error: any) {
    console.error("Lỗi updateSchedule:", error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

// Lấy sơ đồ ghế theo schedule (dùng cho Admin xem tình trạng ghế theo chuyến/ngày)
export const getSeatMapBySchedule = async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "ID lịch trình không hợp lệ" });
    }

    const schedule = await Schedule.findById(id).populate("train_id");
    if (!schedule) {
      return res.status(404).json({ success: false, message: "Không tìm thấy lịch trình" });
    }

    const train: any = schedule.train_id;
    if (!train?._id) {
      return res.status(500).json({ success: false, message: "Lịch trình không gắn với đoàn tàu hợp lệ" });
    }

    // Lấy sơ đồ ghế cơ bản của đoàn tàu
    const baseSeatMap = await getSeatsByTrain(String(train._id));

    // Tìm tất cả booking theo schedule để đánh dấu ghế đã đặt
    const bookings = await BookingModel.find({
      schedule_id: new mongoose.Types.ObjectId(id),
      status: { $in: ["pending", "confirmed", "paid"] },
    }).lean();

    const bookedSeatIds = new Set<string>(bookings.map((b) => String(b.seat_id)));

    const { carriages, seatsByCarriage } = baseSeatMap;

    // Gắn trạng thái 'booked' cho các ghế đã được đặt ở schedule này
    const updatedSeatsByCarriage: Record<string, any[]> = {};
    Object.entries(seatsByCarriage).forEach(([carriageId, seats]) => {
      updatedSeatsByCarriage[carriageId] = seats.map((seat: any) => {
        if (bookedSeatIds.has(String(seat._id))) {
          return { ...seat.toObject?.() ?? seat, status: "booked" };
        }
        return seat;
      });
    });

    return res.status(200).json({
      success: true,
      data: {
        carriages,
        seatsByCarriage: updatedSeatsByCarriage,
      },
    });
  } catch (error: any) {
    console.error("Lỗi getSeatMapBySchedule:", error);
    return res.status(500).json({ success: false, message: error.message || "Lỗi server khi lấy sơ đồ ghế theo lịch" });
  }
};