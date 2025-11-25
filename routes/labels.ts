import express from 'express';
import * as labelsController from '../controllers/labels';

const router = express.Router();

router.get('/', labelsController.getAllLabels);
router.post('/', labelsController.createLabel);
router.put('/:id', labelsController.updateLabel);
router.delete('/:id', labelsController.deleteLabel);

export default router;

