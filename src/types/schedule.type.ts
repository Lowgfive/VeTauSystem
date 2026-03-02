import { Types } from "mongoose"

export interface ISchedule {
  train: Types.ObjectId
  departureStation: Types.ObjectId
  arrivalStation: Types.ObjectId

  departureTime: Date
  arrivalTime: Date

  price: number
  availableSeats: number
}