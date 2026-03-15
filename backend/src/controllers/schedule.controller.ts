import { Request, Response } from "express";
import ScheduleService from "../services/schedule.service";


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
    const schedules = await ScheduleService.getAllSchedules();
    return res.status(200).json({ success: true, data: schedules });
  } catch (error: any) {
    console.error("Lỗi getSchedules:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
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