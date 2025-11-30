import { NextFunction, Request, Response } from "express";

export const asyncHandler = <P = any, ResBody = any, ReqBody = any>(
  fn: (req: Request<P, ResBody, ReqBody>, res: Response) => Promise<any>
) => {
  return (
    req: Request<P, ResBody, ReqBody>,
    res: Response,
    next: NextFunction
  ) => {
    Promise.resolve(fn(req, res)).catch(next);
  };
};
