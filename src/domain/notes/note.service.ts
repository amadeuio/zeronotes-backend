import { noteLabelQueries } from "../../db/queries/noteLabels";
import { noteQueries } from "../../db/queries/notes";
import { noteMappers } from "./note.mappers";
import { NoteAPI, NoteCreateRequest, NoteUpdateRequest } from "./note.types";

export const noteService = {
  findAll: async (): Promise<{
    notesById: Record<string, NoteAPI>;
    notesOrder: string[];
  }> => {
    const rows = await noteQueries.findAllWithLabels();
    const sortedRows = [...rows].sort((a, b) => a.order - b.order);

    const notesById: Record<string, NoteAPI> = {};
    const notesOrder: string[] = [];

    for (const row of sortedRows) {
      const note = noteMappers.dbToAPI(row);
      notesById[note.id] = note;
      notesOrder.push(note.id);
    }

    return { notesById, notesOrder };
  },

  create: async (data: NoteCreateRequest): Promise<string> => {
    const minOrder = await noteQueries.getMinOrder();

    const note = await noteQueries.create(
      data.id,
      minOrder,
      data.title,
      data.content,
      data.colorId,
      data.isPinned,
      data.isArchived
    );

    if (Array.isArray(data.labelIds) && data.labelIds.length > 0) {
      await noteLabelQueries.addLabelsToNote(note.id, data.labelIds);
    }

    return note.id;
  },

  update: async (id: string, data: NoteUpdateRequest): Promise<string> => {
    const note = await noteQueries.update(
      id,
      data.title,
      data.content,
      data.colorId,
      data.isPinned,
      data.isArchived
    );

    return note.id;
  },

  delete: async (id: string): Promise<boolean> => {
    return await noteQueries.delete(id);
  },

  addLabel: async (noteId: string, labelId: string): Promise<void> => {
    await noteLabelQueries.addLabelToNote(noteId, labelId);
  },

  removeLabel: async (noteId: string, labelId: string): Promise<void> => {
    await noteLabelQueries.removeLabelFromNote(noteId, labelId);
  },

  reorder: async (noteIds: string[]): Promise<void> => {
    const updates: { id: string; order: number }[] = noteIds.map(
      (id, index) => ({ id, order: index })
    );
    await noteQueries.updateOrders(updates);
  },
};
