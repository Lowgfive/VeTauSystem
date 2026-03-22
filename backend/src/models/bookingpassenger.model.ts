import mongoose, { Schema, Document } from "mongoose";

export interface IBookingPassenger extends Document {
  booking_id: mongoose.Types.ObjectId;
  passenger_id: mongoose.Types.ObjectId;
  seat_id: mongoose.Types.ObjectId;
  ticket_price: number;
  status: 'reserved' | 'confirmed' | 'paid' | 'cancelled';
  
  // Pricing snapshot
  pricing: {
    basePrice: number;
    discountRate: number;
    promotion: number;
    insurance: number;
    totalAmount: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const BookingPassengerSchema = new Schema<IBookingPassenger>(
    {
        booking_id: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
        passenger_id: { type: Schema.Types.ObjectId, ref: "Passenger", required: true },
        seat_id: { type: Schema.Types.ObjectId, ref: "Seat", required: true },
        ticket_price: { type: Number, required: true },
        status: {
      type: String,
      enum: ['reserved', 'confirmed', 'paid', 'cancelled'],
      default: 'reserved',
    },
    pricing: {
      basePrice: { type: Number, required: true },
      discountRate: { type: Number, default: 0 },
      promotion: { type: Number, default: 0 },
      insurance: { type: Number, default: 0 },
      totalAmount: { type: Number, required: true, default: 0 }
    }
  },  { timestamps: true, versionKey: false }
);

// Logic Middleware xử lý tính toán tài chính động
BookingPassengerSchema.pre('save', function(this: IBookingPassenger, next: any) {
    if (this.pricing && this.pricing.basePrice != null) { // Check for null/undefined
        // formula: (base * (1 - discount)) - promotion + insurance
        const calculatedTotal = (this.pricing.basePrice * (1 - this.pricing.discountRate)) 
                              - this.pricing.promotion 
                              + this.pricing.insurance;
        
        this.pricing.totalAmount = Math.max(0, calculatedTotal);
        this.ticket_price = this.pricing.totalAmount; // Sync
    }
    
    next();
});

export const BookingPassenger = mongoose.model<IBookingPassenger>("BookingPassenger", BookingPassengerSchema);
