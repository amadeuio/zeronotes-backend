import express, { Request, Response } from "express";
import { labelService } from "../domain/labels/label.service";
import { LabelCreateRequest } from "../domain/labels/label.types";
import { noteService } from "../domain/notes/note.service";
import {
  NoteCreateRequest,
  NoteUpdateRequest,
} from "../domain/notes/note.types";

const router = express.Router();

const getAllNotes = async (_req: Request, res: Response) => {
  try {
    const notes = await noteService.findAll();
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notes" });
  }
};

const createNote = async (
  req: Request<{}, {}, NoteCreateRequest>,
  res: Response
) => {
  try {
    const data = req.body;

    if (!data.id) {
      res.status(400).json({ error: "id is required" });
      return;
    }

    const noteId = await noteService.create(data);
    res.status(201).json(noteId);
  } catch (error) {
    res.status(500).json({ error: "Failed to create note" });
  }
};

const updateNote = async (
  req: Request<{ id: string }, {}, NoteUpdateRequest>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const noteId = await noteService.update(id, data);

    if (!noteId) {
      res.status(404).json({ error: "Note not found" });
      return;
    }

    res.json(noteId);
  } catch (error) {
    res.status(500).json({ error: "Failed to update note" });
  }
};

const deleteNote = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await noteService.delete(id);

    if (!deleted) {
      res.status(404).json({ error: "Note not found" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete note" });
  }
};

const addLabelToNote = async (
  req: Request<{ id: string; labelId: string }>,
  res: Response
) => {
  try {
    const { id, labelId } = req.params;

    if (!id || !labelId) {
      res.status(400).json({ error: "id and labelId are required" });
      return;
    }

    await noteService.addLabel(id, labelId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to add label to note" });
  }
};

const removeLabelFromNote = async (
  req: Request<{ id: string; labelId: string }>,
  res: Response
) => {
  try {
    const { id, labelId } = req.params;

    if (!id || !labelId) {
      res.status(400).json({ error: "id and labelId are required" });
      return;
    }

    await noteService.removeLabel(id, labelId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to remove label from note" });
  }
};

const createLabelAndAddToNote = async (
  req: Request<{ id: string }, {}, LabelCreateRequest>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const labelData = req.body;

    if (!id || !labelData.id || !labelData.name) {
      res.status(400).json({ error: "id, labelId and name are required" });
      return;
    }

    const label = await labelService.create(labelData);
    await noteService.addLabel(id, labelData.id);

    res.status(201).json(label);
  } catch (error) {
    res.status(500).json({ error: "Failed to create label and add to note" });
  }
};

const reorderNotes = async (
  req: Request<{}, {}, { noteIds: string[] }>,
  res: Response
) => {
  try {
    const { noteIds } = req.body;

    if (!Array.isArray(noteIds) || noteIds.length === 0) {
      res.status(400).json({ error: "noteIds must be a non-empty array" });
      return;
    }

    await noteService.reorder(noteIds);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to reorder notes" });
  }
};

router.get("/", getAllNotes);
router.post("/", createNote);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);
router.post("/:id/labels/:labelId", addLabelToNote);
router.delete("/:id/labels/:labelId", removeLabelFromNote);
router.post("/:id/labels", createLabelAndAddToNote);
router.post("/reorder", reorderNotes);

export default router;
