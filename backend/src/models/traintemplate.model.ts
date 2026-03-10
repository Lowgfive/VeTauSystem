import mongoose, { Schema } from "mongoose";

export interface ITrainTemplate {
  template_name: string;
  description?: string;
  carriage_templates: mongoose.Types.ObjectId[];
  total_seats: number;
}

const trainTemplateSchema = new Schema<ITrainTemplate>(
  {
    template_name: {
      type: String,
      required: true,
      unique: true
    },

    description: {
      type: String
    },

    carriage_templates: [
      {
        type: Schema.Types.ObjectId,
        ref: "CarriageTemplate"
      }
    ],

    total_seats: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

export const TrainTemplate = mongoose.model<ITrainTemplate>(
  "TrainTemplate",
  trainTemplateSchema
);