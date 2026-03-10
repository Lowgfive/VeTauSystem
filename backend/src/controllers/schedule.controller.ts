import { Request, Response } from "express";
import { ScheduleService } from "../services/schedule.service";

export class ScheduleController {
  /**
   * Controller: tự động sinh schedule mới cho 1 train.
   * Body có thể truyền trainId hoặc train_id.
   */
  static async autoGenerateSchedule(req: Request, res: Response) {
    const trainId = (req.body?.trainId ||
      req.body?.train_id ||
      req.params?.trainId) as string | undefined;

    if (!trainId) {
      return res.status(400).json({
        success: false,
        message: "trainId is required",
      });
    }

    try {
      const newSchedule = await ScheduleService.autoGenerateNextSchedule(
        trainId
      );

      return res.status(201).json({
        success: true,
        data: newSchedule,
      });
    } catch (err: any) {
      const message = err?.message || "Failed to auto-generate schedule";

      // Một số lỗi nên trả 404 (không tìm thấy nguồn dữ liệu)
      if (
        message === "Train not found" ||
        message === "No existing schedule for this train"
      ) {
        return res.status(404).json({
          success: false,
          message,
        });
      }

      return res.status(400).json({
        success: false,
        message,
      });
    }
  }

  /**
   * Controller: tự động sinh nhiều schedule cho 1 train trong vòng 1 ngày.
   */
  static async autoGenerateScheduleForOneDay(req: Request, res: Response) {
    const trainId = (req.body?.trainId ||
      req.body?.train_id ||
      req.params?.trainId) as string | undefined;

    if (!trainId) {
      return res.status(400).json({
        success: false,
        message: "trainId is required",
      });
    }

    try {
      const schedules =
        await ScheduleService.autoGenerateSchedulesForOneDay(trainId);

      return res.status(201).json({
        success: true,
        data: schedules,
      });
    } catch (err: any) {
      const message =
        err?.message || "Failed to auto-generate schedules for one day";

      if (
        message === "Train not found" ||
        message === "No existing schedule for this train"
      ) {
        return res.status(404).json({
          success: false,
          message,
        });
      }

      return res.status(400).json({
        success: false,
        message,
      });
    }
  }
}

