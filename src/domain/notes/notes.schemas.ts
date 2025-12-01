import { z } from "zod";

export const createNoteSchema = {
  body: z
    .object({
      id: z.string().uuid("Invalid UUID format"),
      title: z
        .string()
        .max(500, "Title must be at most 500 characters")
        .optional(),
      content: z.string().optional(),
      colorId: z.string().uuid("Invalid color UUID format").optional(),
      isPinned: z.boolean().optional(),
      isArchived: z.boolean().optional(),
      labelIds: z
        .array(z.string().uuid("Invalid label UUID format"))
        .optional(),
    })
    .strict(),
};

export const updateNoteSchema = {
  params: z
    .object({
      id: z.string().uuid("Invalid note UUID format"),
    })
    .strict(),
  body: z
    .object({
      title: z
        .string()
        .max(500, "Title must be at most 500 characters")
        .optional(),
      content: z.string().optional(),
      colorId: z.string().uuid("Invalid color UUID format").optional(),
      isPinned: z.boolean().optional(),
      isArchived: z.boolean().optional(),
      isTrashed: z.boolean().optional(),
    })
    .strict(),
};

export const deleteNoteSchema = {
  params: z
    .object({
      id: z.string().uuid("Invalid note UUID format"),
    })
    .strict(),
};

export const addLabelToNoteSchema = {
  params: z
    .object({
      id: z.string().uuid("Invalid note UUID format"),
      labelId: z.string().uuid("Invalid label UUID format"),
    })
    .strict(),
};

export const removeLabelFromNoteSchema = {
  params: z
    .object({
      id: z.string().uuid("Invalid note UUID format"),
      labelId: z.string().uuid("Invalid label UUID format"),
    })
    .strict(),
};

export const createLabelAndAddToNoteSchema = {
  params: z
    .object({
      id: z.string().uuid("Invalid note UUID format"),
    })
    .strict(),
};

export const reorderNotesSchema = {
  body: z
    .object({
      noteIds: z
        .array(z.string().uuid("Invalid note UUID format"))
        .min(1, "noteIds must be a non-empty array"),
    })
    .strict(),
};

export type CreateNoteBody = z.infer<typeof createNoteSchema.body>;
export type UpdateNoteParams = z.infer<typeof updateNoteSchema.params>;
export type UpdateNoteBody = z.infer<typeof updateNoteSchema.body>;
export type DeleteNoteParams = z.infer<typeof deleteNoteSchema.params>;
export type AddLabelToNoteParams = z.infer<typeof addLabelToNoteSchema.params>;
export type RemoveLabelFromNoteParams = z.infer<
  typeof removeLabelFromNoteSchema.params
>;
export type CreateLabelAndAddToNoteParams = z.infer<
  typeof createLabelAndAddToNoteSchema.params
>;
export type ReorderNotesBody = z.infer<typeof reorderNotesSchema.body>;
