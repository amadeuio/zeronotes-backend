import { NoteAPI, NoteDB } from "./notes.types";

export const noteMappers = {
  dbToAPI: (db: NoteDB & { label_ids?: string[] }): NoteAPI => ({
    id: db.id,
    order: db.order,
    title: db.title,
    content: db.content,
    colorId: db.color_id,
    isPinned: db.is_pinned,
    isArchived: db.is_archived,
    isTrashed: db.is_trashed,
    labelIds: db.label_ids ?? [],
  }),
};
