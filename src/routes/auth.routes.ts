import express, { Request, Response } from "express";
import { userService } from "../domain/users/user.service";
import { AuthError, NotFoundError, ValidationError } from "../errors/AppError";
import { authenticate } from "../middleware/auth.middleware";
import { asyncHandler } from "../utils/asyncHandler";

  const router = express.Router();

const register = asyncHandler(
  async (
    req: Request<{}, {}, { email: string; password: string }>,
    res: Response
  ) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError("Email and password are required");
    }

    const result = await userService.register({ email, password });
    res.status(201).json(result);
  }
);

const login = asyncHandler(
  async (
    req: Request<{}, {}, { email: string; password: string }>,
    res: Response
  ) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError("Email and password are required");
    }

    const result = await userService.login({ email, password });
    res.json(result);
  }
);

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

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, me);

export default router;
