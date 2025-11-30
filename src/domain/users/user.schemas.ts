import { z } from "zod";

export const userCreateSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be at most 100 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

// Type inference
export type UserCreateSchema = z.infer<typeof userCreateSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
