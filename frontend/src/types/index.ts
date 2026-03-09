// Định nghĩa các kiểu dữ liệu cho hệ thống đường sắt

export type StationType = "underground" | "elevated" | "ground";

export interface Station {
  _id: string; // MongoDB use _id
  station_name: string;
  station_code: string;
  station_order: number;
  station_type: StationType;
  line_id: any;
  location: string;
  lat?: number;
  lng?: number;
  is_active: boolean;
}

export interface MetroLine {
  _id: string;
  line_name: string;
  line_code: string;
  stations: Station[] | string[];
  total_distance: number;
  total_stations: number;
  operating_hours: { start: string; end: string };
  frequency_minutes: number;
  is_active: boolean;
}

export type SeatType = 'seat' | 'priority' | 'standing';

export interface SeatTypeInfo {
  id: SeatType;
  name: string;
  description: string;
  priceMultiplier: number;
  icon: string;
}

export type SeatStatus = 'available' | 'booked' | 'locked' | 'maintenance';

export interface Seat {
  _id: string;
  seat_number: string;
  seat_type: SeatType;
  status: SeatStatus;
  carriage_id: string;
  position: { row: number; col: number };
}

export interface Carriage {
  _id: string;
  carriage_number: number;
  seat_type: SeatType;
  total_seats: number;
  standing_capacity: number;
  layout: { rows: number; cols: number };
  train_id: string;
  is_active: boolean;
}

export type TrainType = "4-car" | "6-car" | "8-car";

export interface Train {
  _id: string;
  train_code: string;
  train_name: string;
  train_type: TrainType;
  line_id: MetroLine | string;
  total_carriages: number;
  capacity: number;
  max_speed: number;
  amenities: string[];
  is_active: boolean;
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