const Label = require('../models/Label');

const getAllLabels = async (req, res, next) => {
  try {
    const labels = await Label.findAll();
    res.json(labels);
  } catch (error) {
    next(error);
  }
};

const getLabelById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const label = await Label.findById(id);

    if (!label) {
      return res.status(404).json({ error: 'Label not found' });
    }

    res.json(label);
  } catch (error) {
    next(error);
  }
};

const createLabel = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const label = await Label.create(name);
    res.status(201).json(label);
  } catch (error) {
    next(error);
  }
};

const updateLabel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const label = await Label.update(id, name);

    if (!label) {
      return res.status(404).json({ error: 'Label not found' });
    }

    res.json(label);
  } catch (error) {
    next(error);
  }
};

const deleteLabel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const label = await Label.deleteById(id);

    if (!label) {
      return res.status(404).json({ error: 'Label not found' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllLabels,
  getLabelById,
  createLabel,
  updateLabel,
  deleteLabel,
};

