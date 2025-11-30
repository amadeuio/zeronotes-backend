import { NextFunction, Request, Response } from "express";
import { userService } from "../domain/users/user.service";
import { verifyToken } from "../utils/jwt";
import { AuthError } from "../errors/AppError";

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AuthError("No token provided");
    }

    const token = authHeader.substring(7);

    const userId = await verifyToken(token);
    const user = await userService.findById(userId);

    if (!user) {
      throw new AuthError("User not found");
    }

    req.userId = userId;
    next();
  } catch (error) {
    next(error instanceof AuthError ? error : new AuthError("Invalid or expired token"));
  }
};
