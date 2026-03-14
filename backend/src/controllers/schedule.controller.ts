import { Request, Response } from "express";
import ScheduleService from "../services/schedule.service";


export const autoGenSchedule = async (req: Request, res: Response) => {
  try {
    const maxDay = 10
    const { trainId } = req.body;
    const result = await ScheduleService.generateSchedules(trainId, maxDay)
    return res.status(200).json({error : result})
  } catch (error) {
    console.log(error)
    return res.status(500).json({error : error})
  }
}