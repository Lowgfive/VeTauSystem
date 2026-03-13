import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự").optional(),
  phone: z.string()
    .regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, "Số điện thoại không hợp lệ")
    .optional()
    .or(z.literal("")),
  cccd: z.string()
    .regex(/^[0-9]{9,12}$/, "CCCD/CMND phải bao gồm 9 đến 12 chữ số")
    .optional()
    .or(z.literal("")),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
