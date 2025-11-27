import { NextFunction, Request, Response } from "express";
import { userService } from "../domain/users/user.service";
import { verifyToken } from "../utils/jwt";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "No token provided" });
      return;
    }

    const token = authHeader.substring(7);

    const userId = await verifyToken(token);
    const user = await userService.findById(userId);

    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    req.userId = userId;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
