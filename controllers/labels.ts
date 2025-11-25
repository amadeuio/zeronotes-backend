import { Request, Response, NextFunction } from 'express';
import Label from '../models/Label';
import { CreateLabelRequest } from '../types/labels';

const getAllLabels = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const labels = await Label.findAll();
    res.json(labels);
  } catch (error) {
    next(error);
  }
};

const createLabel = async (req: Request<{}, {}, CreateLabelRequest>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const labelData = req.body;

    if (!labelData.id) {
      res.status(400).json({ error: 'Label id is required' });
      return;
    }

    if (!labelData.name) {
      res.status(400).json({ error: 'Label name is required' });
      return;
    }

    const label = await Label.create(labelData.id, labelData.name);
    res.status(201).json(label);
  } catch (error) {
    next(error);
  }
};

const updateLabel = async (req: Request<{ id: string }, {}, { name: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    const labelId = parseInt(id, 10);
    if (isNaN(labelId)) {
      res.status(400).json({ error: 'Invalid label id' });
      return;
    }

    const label = await Label.update(labelId, name);

    if (!label) {
      res.status(404).json({ error: 'Label not found' });
      return;
    }

    res.json(label);
  } catch (error) {
    next(error);
  }
};

const deleteLabel = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const labelId = parseInt(id, 10);

    if (isNaN(labelId)) {
      res.status(400).json({ error: 'Invalid label id' });
      return;
    }

    const label = await Label.deleteById(labelId);

    if (!label) {
      res.status(404).json({ error: 'Label not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export {
  getAllLabels,
  createLabel,
  updateLabel,
  deleteLabel,
};

