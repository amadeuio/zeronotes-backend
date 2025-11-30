import express, { Request, Response } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { bootstrapService } from "../domain/bootstrap/bootstrap.service";
import { asyncHandler } from "../utils/asyncHandler";

const router = express.Router();

const getBootstrap = asyncHandler(async (req: Request, res: Response) => {
  const bootstrap = await bootstrapService.findAll(req.userId!);
  res.json(bootstrap);
});

router.get("/", authenticate, getBootstrap);

export default router;
