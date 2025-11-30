import { z } from "zod";

export const noteCreateSchema = z.object({
  id: z.string().uuid("Invalid UUID format"),
  title: z.string().max(500, "Title must be at most 500 characters").optional(),
  content: z.string().optional(),
  colorId: z.string().uuid("Invalid color UUID format").optional(),
  isPinned: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  labelIds: z.array(z.string().uuid("Invalid label UUID format")).optional(),
});

export const noteUpdateSchema = z.object({
  title: z.string().max(500, "Title must be at most 500 characters").optional(),
  content: z.string().optional(),
  colorId: z.string().uuid("Invalid color UUID format").optional(),
  isPinned: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  isTrashed: z.boolean().optional(),
});

export const noteIdParamSchema = z.object({
  id: z.string().uuid("Invalid note UUID format"),
});

export const labelIdParamSchema = z.object({
  labelId: z.string().uuid("Invalid label UUID format"),
});

export const noteAndLabelIdParamSchema = z.object({
  id: z.string().uuid("Invalid note UUID format"),
  labelId: z.string().uuid("Invalid label UUID format"),
});

export const reorderNotesSchema = z.object({
  noteIds: z
    .array(z.string().uuid("Invalid note UUID format"))
    .min(1, "noteIds must be a non-empty array"),
});

export type NoteCreateSchema = z.infer<typeof noteCreateSchema>;
export type NoteUpdateSchema = z.infer<typeof noteUpdateSchema>;
export type NoteIdParamSchema = z.infer<typeof noteIdParamSchema>;
export type LabelIdParamSchema = z.infer<typeof labelIdParamSchema>;
export type NoteAndLabelIdParamSchema = z.infer<
  typeof noteAndLabelIdParamSchema
>;
export type ReorderNotesSchema = z.infer<typeof reorderNotesSchema>;
