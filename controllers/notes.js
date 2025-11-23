const Note = require('../models/Note');

const getAllNotes = async (req, res, next) => {
  try {
    const { search, view, labelId } = req.query;
    
    let parsedView = null;
    if (view) {
      parsedView = { type: view };
      if (view === 'label' && labelId) {
        parsedView.id = labelId;
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
    const { title, content, colorId, isPinned, isArchived } = req.body;

    const note = await Note.create(
      title || null,
      content || null,
      colorId,
      isPinned,
      isArchived
    );
    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
};

const updateNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, colorId, isPinned, isArchived, isTrashed } = req.body;

    const note = await Note.update(
      id,
      title,
      content,
      colorId,
      isPinned,
      isArchived,
      isTrashed
    );

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

module.exports = {
  getAllNotes,
  createNote,
  updateNote,
  deleteNote,
};

