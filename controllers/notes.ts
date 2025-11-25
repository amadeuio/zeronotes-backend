import { Request, Response, NextFunction } from 'express';
import Note from '../models/Note';
import Label from '../models/Label';
import pool from '../config/database';
import { CreateNoteRequest } from '../types/notes';

const getAllNotes = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const notes = await Note.findAll();
    res.json(notes);
  } catch (error) {
    next(error);
  }
};

const createNote = async (req: Request<{}, {}, CreateNoteRequest>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, title, content, color_id, is_pinned, is_archived, labels } = req.body;

    if (!id) {
      res.status(400).json({ error: 'Note id is required' });
      return;
    }

    const note = await Note.create(
      id,
      title || null,
      content || null,
      color_id,
      is_pinned,
      is_archived
    );

    if (labels && Array.isArray(labels) && labels.length > 0) {
      const labelIds = labels.map(label => label.id).filter(Boolean);
      if (labelIds.length > 0) {
        await Note.addLabels(note.id, labelIds);
      }
    }

    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
};

const updateNote = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const note = await Note.update(id, updates);
    if (!note) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }

    res.json(note);
  } catch (error) {
    next(error);
  }
};

const deleteNote = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const note = await Note.deleteById(id);

    if (!note) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const addLabelToNote = async (req: Request<{ id: string; label_id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, label_id } = req.params;
    const labelIdNum = parseInt(label_id, 10);

    if (isNaN(labelIdNum)) {
      res.status(400).json({ error: 'Invalid label_id' });
      return;
    }

    const note = await Note.findById(id);
    if (!note) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }

    const labelResult = await pool.query('SELECT * FROM labels WHERE id = $1', [labelIdNum]);
    if (labelResult.rows.length === 0) {
      res.status(404).json({ error: 'Label not found' });
      return;
    }

    const associations = await Note.addLabels(id, [labelIdNum]);
    res.status(201).json(associations[0] || { note_id: id, label_id: labelIdNum });
  } catch (error) {
    next(error);
  }
};

const removeLabelFromNote = async (req: Request<{ id: string; label_id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id, label_id } = req.params;
    const labelIdNum = parseInt(label_id, 10);

    if (isNaN(labelIdNum)) {
      res.status(400).json({ error: 'Invalid label_id' });
      return;
    }

    const note = await Note.findById(id);
    if (!note) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }

    const association = await Note.removeLabel(id, labelIdNum);
    if (!association) {
      res.status(404).json({ error: 'Label association not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const createLabelAndAddToNote = async (req: Request<{ id: string }, {}, { id: number; name: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const labelData = req.body;

    if (!labelData.id) {
      res.status(400).json({ error: 'Label id is required' });
      return;
    }

    if (!labelData.name) {
      res.status(400).json({ error: 'Label name is required' });
      return;
    }

    const note = await Note.findById(id);

    if (!note) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }

    const label = await Label.create(labelData.id, labelData.name);
    const associations = await Note.addLabels(id, [label.id]);

    res.status(201).json({
      label,
      association: associations[0] || { note_id: id, label_id: label.id },
    });
  } catch (error) {
    next(error);
  }
};

export {
  getAllNotes,
  createNote,
  updateNote,
  deleteNote,
  addLabelToNote,
  removeLabelFromNote,
  createLabelAndAddToNote,
};

