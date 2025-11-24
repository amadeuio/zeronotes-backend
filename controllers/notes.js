const Note = require('../models/Note');
const Label = require('../models/Label');

const getAllNotes = async (req, res, next) => {
  try {
    const { search, view, label_id } = req.query;
    
    let parsedView = null;
    if (view) {
      parsedView = { type: view };
      if (view === 'label' && label_id) {
        parsedView.id = label_id;
      }
    }

    const filters = {
      search: search || '',
      view: parsedView
    };

    const notes = await Note.findAll(filters);
    res.json(notes);
  } catch (error) {
    next(error);
  }
};

const createNote = async (req, res, next) => {
  try {
    const { id, title, content, color_id, is_pinned, is_archived, labels } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Note id is required' });
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

const updateNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const note = await Note.update(id, updates);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    next(error);
  }
};

const deleteNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const note = await Note.deleteById(id);

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const addLabelToNote = async (req, res, next) => {
  try {
    const { id, label_id } = req.params;

    const note = await Note.findById(id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const pool = require('../config/database');
    const labelResult = await pool.query('SELECT * FROM labels WHERE id = $1', [label_id]);
    if (labelResult.rows.length === 0) {
      return res.status(404).json({ error: 'Label not found' });
    }

    const associations = await Note.addLabels(id, [label_id]);
    res.status(201).json(associations[0] || { note_id: id, label_id });
  } catch (error) {
    next(error);
  }
};

const removeLabelFromNote = async (req, res, next) => {
  try {
    const { id, label_id } = req.params;

    const note = await Note.findById(id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const association = await Note.removeLabel(id, label_id);
    if (!association) {
      return res.status(404).json({ error: 'Label association not found' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const createLabelAndAddToNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const labelData = req.body;

    if (!labelData.id) {
      return res.status(400).json({ error: 'Label id is required' });
    }

    if (!labelData.name) {
      return res.status(400).json({ error: 'Label name is required' });
    }

    const note = await Note.findById(id);

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
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

module.exports = {
  getAllNotes,
  createNote,
  updateNote,
  deleteNote,
  addLabelToNote,
  removeLabelFromNote,
  createLabelAndAddToNote,
};

