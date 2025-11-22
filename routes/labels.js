const express = require('express');
const router = express.Router();
const labelsController = require('../controllers/labels');

router.get('/', labelsController.getAllLabels);
router.get('/:id', labelsController.getLabelById);
router.post('/', labelsController.createLabel);
router.put('/:id', labelsController.updateLabel);
router.delete('/:id', labelsController.deleteLabel);

module.exports = router;

