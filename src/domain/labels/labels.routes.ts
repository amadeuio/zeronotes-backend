import express, { Request, Response } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { NotFoundError } from "../../utils/AppError";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  labelCreateSchema,
  labelIdParamSchema,
  labelUpdateSchema,
} from "./labels.schemas";
import { labelService } from "./labels.service";

const router = express.Router();

const getAllLabels = asyncHandler(async (req: Request, res: Response) => {
  const labels = await labelService.findAll(req.userId!);
  res.json(labels);
});

const createLabel = asyncHandler(async (req: Request, res: Response) => {
  const data = req.body;
  const labelId = await labelService.create(req.userId!, data);
  res.status(201).json({ id: labelId });
});

const updateLabel = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;

  const labelId = await labelService.update(req.userId!, id, data);

  if (!labelId) {
    throw new NotFoundError("Label");
  }

  res.json({ id: labelId });
});

const deleteLabel = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = await labelService.delete(req.userId!, id);

  if (!deleted) {
    throw new NotFoundError("Label");
  }

  res.status(204).send();
});

router.get("/", authenticate, getAllLabels);
router.post("/", authenticate, validate(labelCreateSchema), createLabel);
router.put(
  "/:id",
  authenticate,
  validate(labelIdParamSchema, "params"),
  validate(labelUpdateSchema),
  updateLabel
);
router.delete(
  "/:id",
  authenticate,
  validate(labelIdParamSchema, "params"),
  deleteLabel
);

export default router;
