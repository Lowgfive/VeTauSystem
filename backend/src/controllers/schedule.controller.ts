import { Request, Response } from "express";
import mongoose from "mongoose";
import ScheduleService from "../services/schedule.service";
import BookingModel from "../models/booking.model";
import { BookingPassenger } from "../models/bookingpassenger.model";
import { Schedule } from "../models/schedule.model";
import { getSeatsByTrain } from "../services/train.service";
import * as seatLockService from "../services/seat.service";


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
    const { trainId, limit } = req.query;
    const filter: Record<string, any> = {};

    if (typeof trainId === "string") {
      filter.train_id = trainId;
    }

    const parsedLimit = typeof limit === "string" ? parseInt(limit, 10) : undefined;
    const schedules = await ScheduleService.getAllSchedules(filter, parsedLimit);
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

    // Tìm ID của tất cả booking theo schedule
    const bookings = await BookingModel.find({
      schedule_id: new mongoose.Types.ObjectId(id),
      status: { $in: ["pending", "confirmed", "paid"] },
    }).select("_id status").lean();

    const bookingIds = bookings.map((b) => b._id);

    // Tìm tất cả booking_passenger thuộc các booking trên
    const bookingPassengers = await BookingPassenger.find({
      booking_id: { $in: bookingIds },
      status: { $in: ["reserved", "confirmed", "paid"] }
    })
      .select("seat_id booking_id")
      .populate({ path: "booking_id", select: "status" })
      .lean();

    const bookedSeatIds = new Set<string>(
      bookingPassengers
        .filter((bp: any) => String(bp.booking_id?.status) !== "pending")
        .map((bp: any) => String(bp.seat_id))
    );
    const pendingSeatIds = new Set<string>(
      bookingPassengers
        .filter((bp: any) => String(bp.booking_id?.status) === "pending")
        .map((bp: any) => String(bp.seat_id))
    );

    const { carriages, seatsByCarriage } = baseSeatMap;

    // Gắn trạng thái 'booked' cho các ghế đã được đặt ở schedule này
    const updatedSeatsByCarriage: Record<string, any[]> = {};
    Object.entries(seatsByCarriage).forEach(([carriageId, seats]) => {
      updatedSeatsByCarriage[carriageId] = seats.map((seat: any) => {
        const seatId = String(seat._id);
        if (bookedSeatIds.has(seatId)) {
          return { ...seat.toObject?.() ?? seat, status: "booked" };
        }
        if (pendingSeatIds.has(seatId)) {
          return { ...seat.toObject?.() ?? seat, status: "locked" };
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

// Seat map for booking flow: available / booked / locked
// GET /api/v1/schedules/:id/seats
export const getSeatsBySchedule = async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const departureStationId =
      typeof req.query.departureStationId === "string"
        ? req.query.departureStationId
        : undefined;
    const arrivalStationId =
      typeof req.query.arrivalStationId === "string"
        ? req.query.arrivalStationId
        : undefined;

    console.log(`[getSeatsBySchedule] Fetching seats for Schedule ID: ${id}`);
    const data = await ScheduleService.getSeatsBySchedule(
      id,
      departureStationId,
      arrivalStationId
    );
    console.log(`[getSeatsBySchedule] Successfully mapped ${data.seats.length} seats.`);

    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error(`[getSeatsBySchedule] ERROR: ${error.message}`, error);

    if (error.message === "ID lịch trình không hợp lệ") {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error.message === "Không tìm thấy lịch trình") {
      return res.status(404).json({ success: false, message: error.message });
    }

    return res.status(500).json({ success: false, message: error.message || "Lỗi server khi lấy danh sách ghế" });
  }
};
