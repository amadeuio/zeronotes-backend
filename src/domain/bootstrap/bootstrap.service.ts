import { labelService } from "../labels/labels.service";
import { noteService } from "../notes/notes.service";
import { BootstrapAPI } from "./bootstrap.types";

export const bootstrapService = {
  findAll: async (userId: string): Promise<BootstrapAPI> => {
    const [notes, labelsById] = await Promise.all([
      noteService.findAll(userId),
      labelService.findAll(userId),
    ]);

    return {
      notesById: notes.notesById,
      notesOrder: notes.notesOrder,
      labelsById: labelsById,
    };
  },
};
