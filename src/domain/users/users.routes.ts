import express, { Request, Response } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { AuthError, NotFoundError } from "../../utils/AppError";
import { asyncHandler } from "../../utils/asyncHandler";
import { loginSchema, registerSchema } from "./users.schemas";
import { userService } from "./users.service";

const router = express.Router();

const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await userService.register({ email, password });
  res.status(201).json(result);
});

const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await userService.login({ email, password });
  res.json(result);
});

const me = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    throw new AuthError();
  }

  const user = await userService.findById(userId);
  if (!user) {
    throw new NotFoundError("User");
  }

  res.json(user);
});

router.post("/register", validate(registerSchema.body), register);
router.post("/login", validate(loginSchema.body), login);
router.get("/me", authenticate, me);

export default router;
