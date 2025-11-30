import express, { Request, Response } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { labelService } from "../domain/labels/label.service";
import {
  LabelCreateRequest,
  LabelUpdateRequest,
} from "../domain/labels/label.types";
import { asyncHandler } from "../utils/asyncHandler";
import { ValidationError, NotFoundError } from "../errors/AppError";

const router = express.Router();

const getAllLabels = asyncHandler(async (req: Request, res: Response) => {
  const labels = await labelService.findAll(req.userId!);
  res.json(labels);
});

const createLabel = asyncHandler(async (
  req: Request<{}, {}, LabelCreateRequest>,
  res: Response
) => {
  const data = req.body;

  if (!data.id || !data.name) {
    throw new ValidationError("id and name are required");
  }

  const labelId = await labelService.create(req.userId!, data);
  res.status(201).json(labelId);
});

const updateLabel = asyncHandler(async (
  req: Request<{ id: string }, {}, LabelUpdateRequest>,
  res: Response
) => {
  const { id } = req.params;
  const data = req.body;

  if (!data.name) {
    throw new ValidationError("Name is required");
  }

  const labelId = await labelService.update(req.userId!, id, data);

  if (!labelId) {
    throw new NotFoundError("Label");
  }

  res.json(labelId);
});

const deleteLabel = asyncHandler(async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const { id } = req.params;
  const deleted = await labelService.delete(req.userId!, id);

  if (!deleted) {
    throw new NotFoundError("Label");
  }

  res.status(204).send();
});

router.get("/", authenticate, getAllLabels);
router.post("/", authenticate, createLabel);
router.put("/:id", authenticate, updateLabel);
router.delete("/:id", authenticate, deleteLabel);

export default router;
