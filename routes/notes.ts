import express from 'express';
import * as notesController from '../controllers/notes';

const router = express.Router();

router.get('/', notesController.getAllNotes);
router.post('/', notesController.createNote);
router.put('/:id', notesController.updateNote);
router.delete('/:id', notesController.deleteNote);
router.post('/:id/labels/:label_id', notesController.addLabelToNote);
router.delete('/:id/labels/:label_id', notesController.removeLabelFromNote);
router.post('/:id/labels', notesController.createLabelAndAddToNote);

export default router;

