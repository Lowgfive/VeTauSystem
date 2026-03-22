import { Request, Response } from "express";
import { SearchService } from "../services/search.service";

export class SearchController {
  static async search(req: Request, res: Response) {
    const {
      departureCode,
      arrivalCode,
      date,
      returndate,
      page = 1,
      limit = 10,
      departureStationCode,
      arrivalStationCode,
    } = req.body;
    // returndate chỉ có khi khứ hồi; một chiều sẽ là undefined — không phải lỗi
    console.log("[search]", {
      departureCode,
      arrivalCode,
      departureStationCode,
      arrivalStationCode,
      date,
      returndate,
      page,
      limit,
    });
    if (!departureCode || !arrivalCode || !date) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const result = await SearchService.searchTrain(
      departureCode,
      arrivalCode,
      date,
      returndate,
      Number(page),
      Number(limit),
      typeof departureStationCode === "string" ? departureStationCode : undefined,
      typeof arrivalStationCode === "string" ? arrivalStationCode : undefined
    );

    res.json(result);
  }
}


