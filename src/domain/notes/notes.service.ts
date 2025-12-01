import { noteLabelRepository } from "../noteLabels/noteLabels.repository";
import { noteMappers } from "./notes.mappers";
import { noteRepository } from "./notes.repository";
import { CreateNoteBody, UpdateNoteBody } from "./notes.schemas";
import { NoteAPI } from "./notes.types";

export const noteService = {
  findAll: async (
    userId: string
  ): Promise<{
    notesById: Record<string, NoteAPI>;
    notesOrder: string[];
  }> => {
    const rows = await noteRepository.findAllWithLabels(userId);
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

  create: async (userId: string, data: CreateNoteBody): Promise<string> => {
    const minOrder = await noteRepository.getMinOrder(userId);

    const note = await noteRepository.create(
      userId,
      data.id,
      minOrder,
      data.title,
      data.content,
      data.colorId,
      data.isPinned,
      data.isArchived
    );

    if (Array.isArray(data.labelIds) && data.labelIds.length > 0) {
      await noteLabelRepository.addLabelsToNote(note.id, data.labelIds);
    }

    return note.id;
  },

  update: async (
    userId: string,
    id: string,
    data: UpdateNoteBody
  ): Promise<string | null> => {
    const note = await noteRepository.update(
      userId,
      id,
      data.title,
      data.content,
      data.colorId,
      data.isPinned,
      data.isArchived
    );
    
    return note ? note.id : null;
  },

  delete: async (userId: string, id: string): Promise<boolean> => {
    return await noteRepository.delete(userId, id);
  },

  addLabel: async (noteId: string, labelId: string): Promise<void> => {
    await noteLabelRepository.addLabelToNote(noteId, labelId);
  },

  removeLabel: async (noteId: string, labelId: string): Promise<void> => {
    await noteLabelRepository.removeLabelFromNote(noteId, labelId);
  },

  reorder: async (userId: string, noteIds: string[]): Promise<void> => {
    const updates: { id: string; order: number }[] = noteIds.map(
      (id, index) => ({ id, order: index })
    );
    await noteRepository.updateOrders(userId, updates);
  },
};
