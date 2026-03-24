export type NormalizedPassengerType =
  | "adult"
  | "child"
  | "student"
  | "elderly"
  | "disabled";

const stripDiacritics = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d")
    .replace(/\u0110/g, "D");

export const normalizePassengerType = (value?: string): NormalizedPassengerType => {
  const normalized = stripDiacritics((value || "adult").toLowerCase().trim());

  if (normalized === "child" || normalized === "tre em") return "child";
  if (normalized === "student" || normalized === "sinh vien") return "student";
  if (normalized === "elderly" || normalized === "nguoi cao tuoi" || normalized === "senior") {
    return "elderly";
  }
  if (normalized === "disabled" || normalized === "nguoi khuyet tat") return "disabled";
  return "adult";
};

export const parseDob = (value?: string): Date | null => {
  if (!value) return null;

  const [year, month, day] = value.split("-").map(Number);
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

export const calculateAgeFromDob = (
  value?: string,
  referenceDate = new Date()
): number | null => {
  const birthDate = parseDob(value);
  if (!birthDate) return null;

  let age = referenceDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = referenceDate.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age;
};

export const validatePassengerTypeAndDob = (
  passengerType?: string,
  dob?: string
): string | null => {
  const normalizedType = normalizePassengerType(passengerType);
  const age = calculateAgeFromDob(dob);

  if (normalizedType === "child") {
    if (!dob || age === null) {
      return "Hành khách loại trẻ em phải có ngày sinh hợp lệ.";
    }

    if (age < 1) {
      return "Hành khách phải đủ 1 tuổi.";
    }

    if (age > 10) {
      return 'Trẻ em phải từ đủ 6 đến 10 tuổi. Vui lòng đổi sang "Người lớn".';
    }
  }

  if (normalizedType === "elderly") {
    if (!dob || age === null) {
      return "Hành khách cao tuổi phải có ngày sinh hợp lệ.";
    }

    if (age < 60) {
      return "Người cao tuổi phải từ 60 tuổi trở lên.";
    }
  }

  return null;
};

export const getPassengerDiscountRate = (passengerType?: string, dob?: string): number => {
  const normalizedType = normalizePassengerType(passengerType);
  const age = calculateAgeFromDob(dob);

  if (normalizedType === "child") {
    if (age === null) return 0;
    if (age < 6) return 1;
    if (age <= 10) return 0.25;
    return 0;
  }

  if (normalizedType === "student") return 0.1;

  if (normalizedType === "elderly") {
    if (age === null) return 0;
    return age >= 60 ? 0.15 : 0;
  }

  return 0;
};
