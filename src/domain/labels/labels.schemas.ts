import { z } from "zod";

export const createLabelSchema = {
  body: z
    .object({
      id: z.string().uuid("Invalid UUID format"),
      name: z
        .string()
        .min(1, "Name is required")
        .max(100, "Name must be at most 100 characters"),
    })
    .strict(),
};

export const updateLabelSchema = {
  params: z
    .object({
      id: z.string().uuid("Invalid label UUID format"),
    })
    .strict(),
  body: z
    .object({
      name: z
        .string()
        .min(1, "Name is required")
        .max(100, "Name must be at most 100 characters"),
    })
    .strict(),
};

export const deleteLabelSchema = {
  params: z
    .object({
      id: z.string().uuid("Invalid label UUID format"),
    })
    .strict(),
};

export type CreateLabelBody = z.infer<typeof createLabelSchema.body>;
export type UpdateLabelParams = z.infer<typeof updateLabelSchema.params>;
export type UpdateLabelBody = z.infer<typeof updateLabelSchema.body>;
export type DeleteLabelParams = z.infer<typeof deleteLabelSchema.params>;
