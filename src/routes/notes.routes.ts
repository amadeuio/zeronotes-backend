import express, { Request, Response } from "express";
import { labelService } from "../domain/labels/label.service";
import { LabelCreateRequest } from "../domain/labels/label.types";
import { noteService } from "../domain/notes/note.service";
import {
  NoteCreateRequest,
  NoteUpdateRequest,
} from "../domain/notes/note.types";
import { NotFoundError, ValidationError } from "../errors/AppError";
import { authenticate } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = express.Router();

const getAllNotes = asyncHandler(async (req: Request, res: Response) => {
  const notes = await noteService.findAll(req.userId!);
  res.json(notes);
});

const createNote = asyncHandler(
  async (req: Request<{}, {}, NoteCreateRequest>, res: Response) => {
    const data = req.body;

    if (!data.id) {
      throw new ValidationError("id is required");
    }

    const noteId = await noteService.create(req.userId!, data);
    res.status(201).json(noteId);
  }
);

const updateNote = asyncHandler(
  async (
    req: Request<{ id: string }, {}, NoteUpdateRequest>,
    res: Response
  ) => {
    const { id } = req.params;
    const data = req.body;

    const noteId = await noteService.update(req.userId!, id, data);

    if (!noteId) {
      throw new NotFoundError("Note");
    }

    res.json(noteId);
  }
);

const deleteNote = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    const deleted = await noteService.delete(req.userId!, id);

    if (!deleted) {
      throw new NotFoundError("Note");
    }

    res.status(204).send();
  }
);

const addLabelToNote = asyncHandler(
  async (req: Request<{ id: string; labelId: string }>, res: Response) => {
    const { id, labelId } = req.params;

    if (!id || !labelId) {
      throw new ValidationError("id and labelId are required");
    }

    await noteService.addLabel(id, labelId);
    res.status(204).send();
  }
);

const removeLabelFromNote = asyncHandler(
  async (req: Request<{ id: string; labelId: string }>, res: Response) => {
    const { id, labelId } = req.params;

    if (!id || !labelId) {
      throw new ValidationError("id and labelId are required");
    }

    await noteService.removeLabel(id, labelId);
    res.status(204).send();
  }
);

const createLabelAndAddToNote = asyncHandler(
  async (
    req: Request<{ id: string }, {}, LabelCreateRequest>,
    res: Response
  ) => {
    const { id } = req.params;
    const labelData = req.body;

    if (!id || !labelData.id || !labelData.name) {
      throw new ValidationError("id, labelId and name are required");
    }

    const label = await labelService.create(req.userId!, labelData);
    await noteService.addLabel(id, labelData.id);

    res.status(201).json(label);
  }
);

const reorderNotes = asyncHandler(
  async (req: Request<{}, {}, { noteIds: string[] }>, res: Response) => {
    const { noteIds } = req.body;

    if (!Array.isArray(noteIds) || noteIds.length === 0) {
      throw new ValidationError("noteIds must be a non-empty array");
    }

    await noteService.reorder(req.userId!, noteIds);
    res.status(204).send();
  }
);

router.get("/", authenticate, getAllNotes);
router.post("/", authenticate, createNote);
router.put("/:id", authenticate, updateNote);
router.delete("/:id", authenticate, deleteNote);
router.post("/:id/labels/:labelId", authenticate, addLabelToNote);
router.delete("/:id/labels/:labelId", authenticate, removeLabelFromNote);
router.post("/:id/labels", authenticate, createLabelAndAddToNote);
router.post("/reorder", authenticate, reorderNotes);

export default router;
