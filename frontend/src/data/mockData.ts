import { Station, Train, Schedule, Carriage, Seat, SeatTypeInfo, Booking } from '../types';

// Danh sách ga đường sắt chính
export const stations: Station[] = [
  { id: 'hn', name: 'Hà Nội', code: 'HN', province: 'Hà Nội' },
  { id: 'nb', name: 'Ninh Bình', code: 'NB', province: 'Ninh Bình' },
  { id: 'tn', name: 'Thanh Hóa', code: 'TH', province: 'Thanh Hóa' },
  { id: 'v', name: 'Vinh', code: 'V', province: 'Nghệ An' },
  { id: 'hue', name: 'Huế', code: 'HUE', province: 'Thừa Thiên Huế' },
  { id: 'dn', name: 'Đà Nẵng', code: 'DN', province: 'Đà Nẵng' },
  { id: 'qn', name: 'Quảng Ngãi', code: 'QN', province: 'Quảng Ngãi' },
  { id: 'bđ', name: 'Bình Định', code: 'BD', province: 'Bình Định' },
  { id: 'nt', name: 'Nha Trang', code: 'NT', province: 'Khánh Hòa' },
  { id: 'pt', name: 'Phan Thiết', code: 'PT', province: 'Bình Thuận' },
  { id: 'sg', name: 'Sài Gòn', code: 'SG', province: 'TP. Hồ Chí Minh' },
];

// Loại ghế và giá
export const seatTypes: SeatTypeInfo[] = [
  {
    id: 'hard_seat',
    name: 'Ngồi cứng',
    description: 'Ghế ngồi cứng, tiết kiệm',
    priceMultiplier: 1.0,
    icon: 'chair'
  },
  {
    id: 'soft_seat',
    name: 'Ngồi mềm điều hòa',
    description: 'Ghế ngồi mềm có điều hòa',
    priceMultiplier: 1.3,
    icon: 'armchair'
  },
  {
    id: 'sleeper_6',
    name: 'Giường nằm khoang 6',
    description: 'Giường nằm cứng 6 người/khoang',
    priceMultiplier: 1.5,
    icon: 'bed'
  },
  {
    id: 'sleeper_4',
    name: 'Giường nằm khoang 4',
    description: 'Giường nằm mềm 4 người/khoang',
    priceMultiplier: 2.0,
    icon: 'bed-double'
  },
  {
    id: 'vip_sleeper_2',
    name: 'Giường nằm khoang 2 VIP',
    description: 'Khoang VIP 2 giường có điều hòa',
    priceMultiplier: 2.5,
    icon: 'hotel'
  }
];

// Danh sách tàu
export const trains: Train[] = [
  {
    id: 'se1',
    code: 'SE1',
    name: 'Thống Nhất',
    type: 'express',
    carriages: [],
    amenities: ['Điều hòa', 'Wifi', 'Ổ cắm điện', 'Nhà vệ sinh']
  },
  {
    id: 'se2',
    code: 'SE2',
    name: 'Thống Nhất',
    type: 'express',
    carriages: [],
    amenities: ['Điều hòa', 'Wifi', 'Ổ cắm điện', 'Nhà vệ sinh']
  },
  {
    id: 'se3',
    code: 'SE3',
    name: 'Bắc Nam',
    type: 'express',
    carriages: [],
    amenities: ['Điều hòa', 'Wifi', 'Nhà vệ sinh']
  },
  {
    id: 'se4',
    code: 'SE4',
    name: 'Bắc Nam',
    type: 'express',
    carriages: [],
    amenities: ['Điều hòa', 'Wifi', 'Nhà vệ sinh']
  },
  {
    id: 'se5',
    code: 'SE5',
    name: 'Sài Gòn Express',
    type: 'express',
    carriages: [],
    amenities: ['Điều hòa', 'Wifi', 'Ổ cắm điện', 'Nhà vệ sinh', 'Đồ ăn']
  },
  {
    id: 'se6',
    code: 'SE6',
    name: 'Sài Gòn Express',
    type: 'express',
    carriages: [],
    amenities: ['Điều hòa', 'Wifi', 'Ổ cắm điện', 'Nhà vệ sinh', 'Đồ ăn']
  },
  {
    id: 'spt1',
    code: 'SPT1',
    name: 'Sài Gòn - Phan Thiết',
    type: 'standard',
    carriages: [],
    amenities: ['Điều hòa', 'Nhà vệ sinh']
  },
  {
    id: 'spt2',
    code: 'SPT2',
    name: 'Sài Gòn - Phan Thiết',
    type: 'standard',
    carriages: [],
    amenities: ['Điều hòa', 'Nhà vệ sinh']
  }
];

// Tạo toa tàu cho mỗi tàu
function generateCarriages(trainId: string): Carriage[] {
  const carriageTypes = [
    { type: 'hard_seat' as const, count: 2, seatsPerCarriage: 64 },
    { type: 'soft_seat' as const, count: 2, seatsPerCarriage: 64 },
    { type: 'sleeper_6' as const, count: 2, seatsPerCarriage: 42 },
    { type: 'sleeper_4' as const, count: 2, seatsPerCarriage: 28 },
    { type: 'vip_sleeper_2' as const, count: 1, seatsPerCarriage: 14 }
  ];

  const carriages: Carriage[] = [];
  let carriageNumber = 1;

  carriageTypes.forEach(({ type, count, seatsPerCarriage }) => {
    for (let i = 0; i < count; i++) {
      const layout = type.includes('seat')
        ? { rows: 16, cols: 4 }
        : type === 'sleeper_4'
          ? { rows: 7, cols: 4 }
          : type === 'sleeper_6'
            ? { rows: 7, cols: 6 }
            : { rows: 7, cols: 2 };

      carriages.push({
        id: `${trainId}-c${carriageNumber}`,
        number: carriageNumber,
        type,
        totalSeats: seatsPerCarriage,
        availableSeats: Math.floor(seatsPerCarriage * (0.5 + Math.random() * 0.5)),
        layout,
        trainId
      });
      carriageNumber++;
    }
  });

  return carriages;
}

// Gán toa tàu cho mỗi tàu
trains.forEach(train => {
  train.carriages = generateCarriages(train.id);
});

// Tạo ghế cho một toa
export function generateSeatsForCarriage(carriage: Carriage): Seat[] {
  const seats: Seat[] = [];
  const { rows, cols } = carriage.layout;
  const bookedPercentage = 1 - (carriage.availableSeats / carriage.totalSeats);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const seatNumber = `${carriage.number}${String.fromCharCode(65 + col)}${row + 1}`;
      const isBooked = Math.random() < bookedPercentage;

      seats.push({
        id: `${carriage.id}-${seatNumber}`,
        number: seatNumber,
        type: carriage.type,
        status: isBooked ? 'booked' : 'available',
        carriageId: carriage.id,
        position: { row, col }
      });
    }
  }

  return seats;
}

// Tạo lịch trình
function generateSchedules(date: string): Schedule[] {
  const schedules: Schedule[] = [];

  // Tàu Hà Nội - Sài Gòn (SE1, SE3, SE5)
  const northToSouthTrains = ['se1', 'se3', 'se5'];
  northToSouthTrains.forEach((trainId, index) => {
    const train = trains.find(t => t.id === trainId)!;
    const departureHour = 6 + index * 6;

    schedules.push({
      id: `${trainId}-${date}`,
      trainId,
      train,
      originId: 'hn',
      origin: stations[0],
      destinationId: 'sg',
      destination: stations[10],
      departureTime: `${String(departureHour).padStart(2, '0')}:00`,
      arrivalTime: `${String((departureHour + 30) % 24).padStart(2, '0')}:00`,
      date,
      basePrice: 1200000,
      availableSeats: train.carriages.reduce((sum, c) => sum + c.availableSeats, 0),
      duration: '30h 00m',
      status: 'on-time'
    });
  });

  // Tàu Sài Gòn - Hà Nội (SE2, SE4, SE6)
  const southToNorthTrains = ['se2', 'se4', 'se6'];
  southToNorthTrains.forEach((trainId, index) => {
    const train = trains.find(t => t.id === trainId)!;
    const departureHour = 7 + index * 6;

    schedules.push({
      id: `${trainId}-${date}`,
      trainId,
      train,
      originId: 'sg',
      origin: stations[10],
      destinationId: 'hn',
      destination: stations[0],
      departureTime: `${String(departureHour).padStart(2, '0')}:00`,
      arrivalTime: `${String((departureHour + 30) % 24).padStart(2, '0')}:00`,
      date,
      basePrice: 1200000,
      availableSeats: train.carriages.reduce((sum, c) => sum + c.availableSeats, 0),
      duration: '30h 00m',
      status: 'on-time'
    });
  });

  // Tàu Hà Nội - Đà Nẵng
  schedules.push({
    id: `se1-dn-${date}`,
    trainId: 'se1',
    train: trains[0],
    originId: 'hn',
    origin: stations[0],
    destinationId: 'dn',
    destination: stations[5],
    departureTime: '08:00',
    arrivalTime: '22:30',
    date,
    basePrice: 800000,
    availableSeats: 156,
    duration: '14h 30m',
    status: 'on-time'
  });

  // Tàu Đà Nẵng - Nha Trang
  schedules.push({
    id: `se3-nt-${date}`,
    trainId: 'se3',
    train: trains[2],
    originId: 'dn',
    origin: stations[5],
    destinationId: 'nt',
    destination: stations[8],
    departureTime: '09:30',
    arrivalTime: '19:00',
    date,
    basePrice: 500000,
    availableSeats: 142,
    duration: '9h 30m',
    status: 'on-time'
  });

  // Tàu Sài Gòn - Phan Thiết
  schedules.push({
    id: `spt1-${date}`,
    trainId: 'spt1',
    train: trains[6],
    originId: 'sg',
    origin: stations[10],
    destinationId: 'pt',
    destination: stations[9],
    departureTime: '06:00',
    arrivalTime: '10:30',
    date,
    basePrice: 150000,
    availableSeats: 98,
    duration: '4h 30m',
    status: 'on-time'
  });

  schedules.push({
    id: `spt2-${date}`,
    trainId: 'spt2',
    train: trains[7],
    originId: 'sg',
    origin: stations[10],
    destinationId: 'pt',
    destination: stations[9],
    departureTime: '14:00',
    arrivalTime: '18:30',
    date,
    basePrice: 150000,
    availableSeats: 105,
    duration: '4h 30m',
    status: 'on-time'
  });

  return schedules;
}

// Cache lịch trình theo ngày
const scheduleCache: { [date: string]: Schedule[] } = {};

export function getSchedules(date: string): Schedule[] {
  if (!scheduleCache[date]) {
    scheduleCache[date] = generateSchedules(date);
  }
  return scheduleCache[date];
}

// Tìm kiếm lịch trình
export function searchSchedules(
  originId: string,
  destinationId: string,
  date: string
): Schedule[] {
  const allSchedules = getSchedules(date);
  return allSchedules.filter(
    s => s.originId === originId && s.destinationId === destinationId
  );
}

// Mock bookings
export const mockBookings: Booking[] = [];

export function generateBookingCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
