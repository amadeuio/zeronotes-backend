import { Request, Response } from "express";
import { AppError } from "../errors/AppError";

export function errorHandler(err: Error, _req: Request, res: Response) {
  console.error(err);

  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: err.message,
      code: err.code,
    });
  }

  return res.status(500).json({
    error: "Internal server error",
    code: "SERVER_ERROR",
  });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: `Route ${req.method} ${req.path} not found`,
    code: "NOT_FOUND",
  });
}
