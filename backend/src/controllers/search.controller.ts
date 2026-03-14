import { Request, Response } from "express";
import { SearchService } from "../services/search.service";

export class SearchController {
  static async search(req: Request, res: Response) {
    const { departureCode, arrivalCode, date , returndate} = req.body;
    console.log(departureCode, arrivalCode, date , returndate)
    if (!departureCode || !arrivalCode || !date) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const result = await SearchService.searchTrain(
      departureCode,
      arrivalCode,
      date,
      returndate
    );

    res.json(result);
  }
}


