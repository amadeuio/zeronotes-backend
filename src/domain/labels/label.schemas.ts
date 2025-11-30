import { z } from "zod";

export const labelCreateSchema = z.object({
  id: z.string().uuid("Invalid UUID format"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
});

export const labelUpdateSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
});

export const labelIdParamSchema = z.object({
  id: z.string().uuid("Invalid label UUID format"),
});

export type LabelCreateSchema = z.infer<typeof labelCreateSchema>;
export type LabelUpdateSchema = z.infer<typeof labelUpdateSchema>;
export type LabelIdParamSchema = z.infer<typeof labelIdParamSchema>;
