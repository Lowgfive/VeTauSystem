// Định nghĩa các kiểu dữ liệu cho hệ thống đường sắt

export interface Station {
  id: string;
  name: string;
  code: string;
  province: string;
}

export type SeatType = 'ngoi-cung' | 'ngoi-mem' | 'nam-cung' | 'nam-mem' | 'nam-khoang-4' | 'nam-khoang-6';

export interface SeatTypeInfo {
  id: SeatType;
  name: string;
  description: string;
  priceMultiplier: number;
  icon: string;
}

export type SeatStatus = 'available' | 'selected' | 'booked';

export interface Seat {
  id: string;
  number: string;
  type: SeatType;
  status: SeatStatus;
  carriageId: string;
  position: { row: number; col: number };
}

export interface Carriage {
  id: string;
  number: number;
  type: SeatType;
  totalSeats: number;
  availableSeats: number;
  layout: { rows: number; cols: number };
  trainId: string;
}

export interface Train {
  id: string;
  code: string;
  name: string;
  type: 'express' | 'standard';
  carriages: Carriage[];
  amenities: string[];
}

export interface Schedule {
  id: string;
  trainId: string;
  train: Train;
  originId: string;
  origin: Station;
  destinationId: string;
  destination: Station;
  departureTime: string;
  arrivalTime: string;
  date: string;
  basePrice: number;
  availableSeats: number;
  duration: string;
  status: 'on-time' | 'delayed' | 'cancelled';
}

export interface Passenger {
  id: string;
  fullName: string;
  idNumber: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  seatId: string;
}

export interface Booking {
  id: string;
  bookingCode: string;
  scheduleId: string;
  schedule: Schedule;
  passengers: Passenger[];
  totalAmount: number;
  status: 'confirmed' | 'cancelled' | 'pending' | 'completed';
  paymentStatus: 'paid' | 'pending' | 'refunded';
  paymentMethod: 'credit-card' | 'bank-transfer' | 'momo' | 'vnpay';
  createdAt: string;
  seats: Seat[];
  // Additional fields for MyBookingsPage
  trainNumber: string;
  route: {
    origin: string;
    destination: string;
  };
  departureDateTime: string;
  arrivalDateTime: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
}

export interface SearchParams {
  originId: string;
  destinationId: string;
  date: string;
  seatType?: SeatType;
  passengers?: number;
}