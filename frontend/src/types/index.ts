// Định nghĩa các kiểu dữ liệu cho hệ thống đường sắt

export type StationType = "underground" | "elevated" | "ground";

export interface Station {
  _id: string;
  station_name: string;
  station_code: string;
  station_order: number;
  station_type: StationType;
  location: string;
  lat?: number;
  lng?: number;
  is_active: boolean;
}


export type SeatType = 'hard_seat' | 'soft_seat' | 'sleeper_6' | 'sleeper_4' | 'vip_sleeper_2';

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
  total_carriages: number;
  capacity: number;
  max_speed: number;
  amenities: string[];
  is_active: boolean;
  status?: string;
  template_id?: any;
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
  dateOfBirth?: string;
  seatId: string;
  passengerType: 'Người lớn' | 'Trẻ em' | 'Sinh viên' | 'Người cao tuổi';
}

export interface Booking {
  id: string;
  bookingCode: string;
  scheduleId: string;
  schedule: Schedule;
  passengers: Passenger[];
  totalAmount: number;
  status: 'confirmed' | 'cancelled' | 'pending' | 'completed' | 'paid' | 'refunded' | 'changed';
  is_group_booking?: boolean;
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
  /** Tên ga hiển thị — gửi lên API tìm chuyến */
  originName?: string;
  destinationName?: string;
  /** Mã ga (HN, NB…) — fallback khi tên trong DB khác UI */
  originCode?: string;
  destinationCode?: string;
  returnDate?: string;
  seatType?: SeatType;
  passengers?: number;
}