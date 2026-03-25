export const REFUND_POLICY = {
  INDIVIDUAL: [
    { threshold_hours: 24, refund_percent: 0.9 }, // 10% fee
    { threshold_hours: 4, refund_percent: 0.8 },  // 20% fee
    { threshold_hours: 0, refund_percent: 0 },    // No refund
  ],
  GROUP: [
    { threshold_hours: 72, refund_percent: 0.9 }, // 10% fee
    { threshold_hours: 24, refund_percent: 0.8 }, // 20% fee
    { threshold_hours: 0, refund_percent: 0 },    // No refund
  ]
};

export const CHANGE_POLICY = {
  MIN_HOURS: 24,
  FEE_PER_TICKET: 20000,
  ALLOW_GROUP: false,
};

/**
 * Calculate refund amount based on departure time and booking type
 * @param departureDate Departure date
 * @param departureTime Departure time (HH:mm)
 * @param totalAmount Original booking amount
 * @param isGroup Whether it's a group booking
 * @returns { refundAmount: number, feeAmount: number, percent: number }
 */
export const calculateRefund = (
  departureDate: string | Date,
  departureTime: string,
  totalAmount: number,
  isGroup: boolean = false
) => {
  const depTime = new Date(departureDate);
  const [hours, minutes] = departureTime.split(":").map(Number);
  depTime.setHours(hours, minutes, 0, 0);

  const now = new Date();
  const diffMs = depTime.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  const policies = isGroup ? REFUND_POLICY.GROUP : REFUND_POLICY.INDIVIDUAL;
  
  // Find the first policy that applies
  const policy = policies.find(p => diffHours >= p.threshold_hours) || { threshold_hours: 0, refund_percent: 0 };

  const refundAmount = totalAmount * policy.refund_percent;
  const feeAmount = totalAmount - refundAmount;

  return {
    refundAmount,
    feeAmount,
    percent: policy.refund_percent * 100,
    diffHours,
  };
};

/**
 * Check if a booking can be changed and calculate the fee
 * @param departureDate Departure date
 * @param departureTime Departure time (HH:mm)
 * @param isGroup Whether it's a group booking
 */
export const canChangeTicket = (
  departureDate: string | Date,
  departureTime: string,
  isGroup: boolean = false
) => {
  if (isGroup && !CHANGE_POLICY.ALLOW_GROUP) {
    return { allowed: false, reason: "Vé tập thể không được phép đổi" };
  }

  const depTime = new Date(departureDate);
  const [hours, minutes] = departureTime.split(":").map(Number);
  depTime.setHours(hours, minutes, 0, 0);

  const now = new Date();
  const diffMs = depTime.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < CHANGE_POLICY.MIN_HOURS) {
    return { allowed: false, reason: `Chỉ được đổi vé trước giờ tàu chạy ≥ ${CHANGE_POLICY.MIN_HOURS} giờ` };
  }

  return { allowed: true, fee: CHANGE_POLICY.FEE_PER_TICKET };
};
