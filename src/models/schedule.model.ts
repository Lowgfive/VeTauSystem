import mongoose, { Schema } from "mongoose"
import { ISchedule } from "../types/schedule.type"

const ScheduleSchema = new Schema<ISchedule>(
  {
    train: {
      type: Schema.Types.ObjectId,
      ref: "Train",
      required: true,
    },
    departureStation: {
      type: Schema.Types.ObjectId,
      ref: "Station",
      required: true,
    },
    arrivalStation: {
      type: Schema.Types.ObjectId,
      ref: "Station",
      required: true,
    },
    departureTime: {
      type: Date,
      required: true,
    },
    arrivalTime: {
      type: Date,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    availableSeats: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

export const Schedule = mongoose.model<ISchedule>(
  "Schedule",
  ScheduleSchema
)