import mongoose, { Schema, Document } from "mongoose";

export interface IPassenger {
    fullName: string;
    idNumber: string;
    phone: string;
    email: string;
    dateOfBirth: string;
    seatId: string;
}

export interface IBooking extends Document {
    bookingCode: string;
    userId: mongoose.Types.ObjectId;
    scheduleId: mongoose.Types.ObjectId; // References Schedule (not implemented fully)
    passengers: IPassenger[];
    totalAmount: number;
    status: 'confirmed' | 'cancelled' | 'pending' | 'completed';
    paymentStatus: 'paid' | 'pending' | 'refunded';
    paymentMethod: 'credit-card' | 'bank-transfer' | 'momo' | 'vnpay';
    // Mock fields for now to satisfy the frontend's MyBookingsPage requirements
    trainNumber: string;
    routeOrigin: string;
    routeDestination: string;
    departureTime: string;
    arrivalTime: string;
    createdAt: Date;
    updatedAt: Date;
}

const PassengerSchema = new Schema<IPassenger>({
    fullName: { type: String, required: true },
    idNumber: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    dateOfBirth: { type: String, required: true },
    seatId: { type: String, required: true }
}, { _id: false });

const BookingSchema = new Schema<IBooking>({
    bookingCode: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    scheduleId: { type: Schema.Types.ObjectId, ref: "Schedule" },
    passengers: [PassengerSchema],
    totalAmount: { type: Number, required: true, default: 0 },
    status: { 
        type: String, 
        enum: ['confirmed', 'cancelled', 'pending', 'completed'], 
        default: 'pending' 
    },
    paymentStatus: { 
        type: String, 
        enum: ['paid', 'pending', 'refunded'], 
        default: 'pending' 
    },
    paymentMethod: { 
        type: String, 
        enum: ['credit-card', 'bank-transfer', 'momo', 'vnpay'],
        required: true
    },
    trainNumber: { type: String },
    routeOrigin: { type: String },
    routeDestination: { type: String },
    departureTime: { type: String },
    arrivalTime: { type: String },
}, {
    timestamps: true,
    versionKey: false,
});

export default mongoose.model<IBooking>("Booking", BookingSchema);
