import { LabelAPI } from "../labels/labels.types";
import { NoteAPI } from "../notes/notes.types";

export interface BootstrapAPI {
  notesById: Record<string, NoteAPI>;
  notesOrder: string[];
  labelsById: Record<string, LabelAPI>;
}
