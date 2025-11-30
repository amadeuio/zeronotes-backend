import { NextFunction, Request, Response } from "express";
import { z, ZodError, ZodIssue } from "zod";
import { ValidationError } from "../utils/AppError";

export const validate =
  <T extends z.ZodTypeAny>(
    schema: T,
    property: "body" | "params" | "query" = "body"
  ) =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req[property]);
      req[property] = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues
          .map((err: ZodIssue) => `${err.path.join(".")}: ${err.message}`)
          .join(", ");
        next(new ValidationError(errorMessages));
      } else {
        next(error);
      }
    }
  };
