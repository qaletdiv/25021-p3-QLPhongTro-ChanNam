import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }).normalize(),
  password: z.string().min(6, { message: "Mật khẩu tối thiểu 6 ký tự" }),
});

export const registerSchema = z.object({
  name: z.string().nonempty({ message: "Tên không được để trống" }).trim(),
  email: z.string().email({ message: "Email không hợp lệ" }).normalize(),
  phone: z
    .string()
    .regex(/^(0|\+84)[3-9]\d{8,9}$/, { message: "Số điện thoại không hợp lệ" }),
  password: z.string().min(6, { message: "Mật khẩu tối thiểu 6 ký tự" }),
  confirmPassword: z.string(),
  role: z.enum(["landlord", "tenant"], { message: "Vai trò không hợp lệ" }),
  cccd: z.string().optional().trim(),
});