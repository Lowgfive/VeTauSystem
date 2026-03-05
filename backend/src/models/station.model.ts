import mongoose, { Schema } from "mongoose";
import { IStation } from "../types/station.type";

const stationSchema = new Schema<IStation>(
  {
    station_name : {
      type : String,
      unique : true,
      required : true
    },
    location : {
      type : String,
      required : true
    }
  },
  { timestamps: true }
);

export const Station = mongoose.model<IStation>("Station", stationSchema);


