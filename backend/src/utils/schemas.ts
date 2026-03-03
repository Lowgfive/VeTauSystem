import { z } from "zod";

// ────────────────────────────────────────────
// Auth schemas
// ────────────────────────────────────────────
export const loginSchema = z.object({
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

export const registerSchema = z.object({
    name: z.string().min(2, "Tên tối thiểu 2 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

// ────────────────────────────────────────────
// Search schema
// ────────────────────────────────────────────
export const searchScheduleSchema = z.object({
    fromStation: z.string().min(1, "Ga đi là bắt buộc"),
    toStation: z.string().min(1, "Ga đến là bắt buộc"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày phải theo định dạng YYYY-MM-DD"),
    tripType: z.enum(["one-way", "round-trip"]).default("one-way"),
});

// ────────────────────────────────────────────
// Seat lock schema
// ────────────────────────────────────────────
export const lockSeatSchema = z.object({
    scheduleId: z.string().min(1),
    seatId: z.string().min(1),
    sessionId: z.string().min(1),
});

// ────────────────────────────────────────────
// Booking schema
// ────────────────────────────────────────────
const passengerSchema = z.object({
    name: z.string().min(2, "Tên hành khách tối thiểu 2 ký tự"),
    idCard: z.string().min(9, "Số CCCD không hợp lệ").max(12),
    passengerType: z.enum(["adult", "child", "student", "elderly", "disabled"]),
    seatId: z.string().min(1),
});

export const createBookingSchema = z.object({
    scheduleId: z.string().min(1),
    sessionId: z.string().min(1),
    passengers: z
        .array(passengerSchema)
        .min(1, "Phải có ít nhất 1 hành khách")
        .max(4, "Tối đa 4 hành khách mỗi đơn hàng"),
    contactName: z.string().min(2),
    contactPhone: z
        .string()
        .regex(/^(0|\+84)[3-9]\d{8}$/, "Số điện thoại không hợp lệ"),
    contactEmail: z.string().email("Email không hợp lệ"),
    paymentMethod: z.enum(["vnpay", "momo", "cash"]),
});

// ────────────────────────────────────────────
// Refund schema
// ────────────────────────────────────────────
export const refundSchema = z.object({
    bookingCode: z.string().min(1),
    email: z.string().email(),
    reason: z.string().optional(),
});

// ────────────────────────────────────────────
// TypeScript types inferred from schemas
// ────────────────────────────────────────────
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type SearchScheduleInput = z.infer<typeof searchScheduleSchema>;
export type LockSeatInput = z.infer<typeof lockSeatSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type RefundInput = z.infer<typeof refundSchema>;
