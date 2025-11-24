const express = require('express');
const router = express.Router();
const notesController = require('../controllers/notes');

router.get('/', notesController.getAllNotes);
router.post('/', notesController.createNote);
router.put('/:id', notesController.updateNote);
router.delete('/:id', notesController.deleteNote);
router.post('/:id/labels/:label_id', notesController.addLabelToNote);
router.delete('/:id/labels/:label_id', notesController.removeLabelFromNote);
router.post('/:id/labels', notesController.createLabelAndAddToNote);

module.exports = router;

