import mongoose, { Schema } from "mongoose";
import { ISchedule } from "../types/schedule.type";

const ScheduleSchema = new Schema<ISchedule>(
  {
    route_id: {
      type: Schema.Types.ObjectId,
      ref: "Route",
      required: true,
    },
    train_id: {
      type: Schema.Types.ObjectId,
      ref: "Train",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    departure_time: {
      type: String,
      required: true,
    },
    arrival_time: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["SCHEDULED", "DELAYED", "CANCELLED", "MAINTENANCE"],
      default: "SCHEDULED"
    }
  },
  { timestamps: true }
);

export const Schedule = mongoose.model<ISchedule>("Schedule", ScheduleSchema);
