export type PassengerType = 'Người lớn' | 'Trẻ em' | 'Sinh viên' | 'Người cao tuổi';

export const CHILD_FREE_MAX_AGE = 5;
export const CHILD_DISCOUNT_MAX_AGE = 10;
export const SENIOR_MIN_AGE = 60;

export const parseDateInput = (value?: string): Date | null => {
  if (!value) return null;

  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;

  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return null;

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
};

export const calculateAgeFromDateString = (value?: string, referenceDate = new Date()): number | null => {
  const birthDate = parseDateInput(value);
  if (!birthDate) return null;

  let age = referenceDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = referenceDate.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age;
};

export const getPassengerDobError = (passengerType: PassengerType, value?: string): string | null => {
  if (!value) return null;

  const birthDate = parseDateInput(value);
  const now = new Date();

  if (!birthDate) {
    return 'Ngày sinh không hợp lệ';
  }

  if (birthDate > now) {
    return 'Ngày sinh không hợp lệ';
  }

  const age = calculateAgeFromDateString(value, now);
  if (age === null) {
    return 'Ngày sinh không hợp lệ';
  }

  if (age < 1) {
    return 'Hành khách phải đủ 1 tuổi';
  }

  if (age > 120) {
    return 'Ngày sinh không hợp lệ';
  }

  if (passengerType === 'Trẻ em' && age > CHILD_DISCOUNT_MAX_AGE) {
    return 'Trẻ em phải từ đủ 6 đến 10 tuổi. Vui lòng đổi sang "Người lớn".';
  }

  if (passengerType === 'Người cao tuổi' && age < SENIOR_MIN_AGE) {
    return 'Người cao tuổi phải từ 60 tuổi trở lên.';
  }

  return null;
};

export const getPassengerDiscountRate = (passengerType: PassengerType, dateOfBirth?: string): number => {
  const age = calculateAgeFromDateString(dateOfBirth);

  if (passengerType === 'Trẻ em') {
    if (age === null) return 0;
    if (age <= CHILD_FREE_MAX_AGE) return 1;
    if (age <= CHILD_DISCOUNT_MAX_AGE) return 0.25;
    return 0;
  }

  if (passengerType === 'Sinh viên') return 0.1;
  if (passengerType === 'Người cao tuổi') return 0.15;
  return 0;
};

export const calculatePassengerFare = (
  basePrice: number,
  passengerType: PassengerType,
  insuranceFee: number,
  dateOfBirth?: string
): number => {
  const discountRate = getPassengerDiscountRate(passengerType, dateOfBirth);
  return Math.round(basePrice * (1 - discountRate) + insuranceFee);
};

export const getChildAgeNotice = (passengerType: PassengerType, dateOfBirth?: string): string | null => {
  if (passengerType !== 'Trẻ em') return null;

  const age = calculateAgeFromDateString(dateOfBirth);
  if (age === null || age > CHILD_FREE_MAX_AGE) return null;

  return 'Trẻ dưới 6 tuổi miễn vé, cần đi cùng người lớn và ngồi chung ghế.';
};
